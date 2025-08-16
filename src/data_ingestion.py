import re
import logging
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

from youtube_transcript_api import (
    YouTubeTranscriptApi, 
    TranscriptsDisabled, 
    NoTranscriptFound,
    CouldNotRetrieveTranscript
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TranscriptConfig:
    """Configuration for transcript processing."""
    chunk_size: int = 1000
    chunk_overlap: int = 200
    preferred_langs: List[str] = None
    include_auto_generated: bool = True
    preserve_formatting: bool = False
    
    def __post_init__(self):
        if self.preferred_langs is None:
            self.preferred_langs = ['en', 'en-US', 'en-GB']

class YouTubeTranscriptProcessor:
    """Enhanced YouTube transcript processor with latest API methods."""
    
    def __init__(self, config: Optional[TranscriptConfig] = None):
        self.config = config or TranscriptConfig()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.chunk_size,
            chunk_overlap=self.config.chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )
        self.api = YouTubeTranscriptApi()
    
    @staticmethod
    def extract_video_id(url_or_id: str) -> str:
        """
        Extract video ID from various YouTube URL formats.
        
        Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://m.youtube.com/watch?v=VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - Direct video ID
        """
        patterns = [
            r'(?:v=|/)([0-9A-Za-z_-]{11}).*',
            r'youtu\.be/([0-9A-Za-z_-]{11})',
            r'embed/([0-9A-Za-z_-]{11})',
            r'^([0-9A-Za-z_-]{11})$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url_or_id)
            if match:
                return match.group(1)
        
        raise ValueError(f"Could not extract video ID from: {url_or_id}")
    
    def get_available_transcripts(self, video_url_or_id: str) -> Dict[str, Any]:
        """Get information about available transcripts for a video."""
        video_id = self.extract_video_id(video_url_or_id)
        
        try:
            transcript_list = self.api.list(video_id)
            available = {
                'manual': [],
                'auto_generated': []
            }
            
            for transcript in transcript_list:
                transcript_info = {
                    'language': transcript.language,
                    'language_code': transcript.language_code,
                    'is_generated': transcript.is_generated,
                    'is_translatable': transcript.is_translatable
                }
                
                if transcript.is_generated:
                    available['auto_generated'].append(transcript_info)
                else:
                    available['manual'].append(transcript_info)
            
            return available
            
        except Exception as e:
            logger.error(f"Failed to list transcripts for {video_id}: {e}")
            return {'manual': [], 'auto_generated': []}
    
    def fetch_transcript(self, video_url_or_id: str) -> str:
        """
        Fetch transcript using the latest API methods.
        """
        video_id = self.extract_video_id(video_url_or_id)
        logger.info(f"Fetching transcript for video ID: {video_id}")
        
        try:
            # Method 1: Try direct fetch with preferred languages
            try:
                fetched_transcript = self.api.fetch(video_id, languages=self.config.preferred_langs)
                logger.info(f"Found transcript in language: {fetched_transcript.language_code}")
                
            except NoTranscriptFound:
                # Method 2: Use list() and find methods for more control
                transcript_list = self.api.list(video_id)
                transcript_obj = None
                
                # Try manual transcripts first
                try:
                    transcript_obj = transcript_list.find_transcript(self.config.preferred_langs)
                    logger.info(f"Found manual transcript in language: {transcript_obj.language_code}")
                    fetched_transcript = transcript_obj.fetch()
                    
                except NoTranscriptFound:
                    if self.config.include_auto_generated:
                        try:
                            transcript_obj = transcript_list.find_generated_transcript(self.config.preferred_langs)
                            logger.info(f"Found auto-generated transcript in language: {transcript_obj.language_code}")
                            fetched_transcript = transcript_obj.fetch()
                            
                        except NoTranscriptFound:
                            # Try translating available transcripts
                            available_transcripts = list(transcript_list)
                            if available_transcripts:
                                transcript_obj = available_transcripts[0].translate('en')
                                logger.info(f"Using translated transcript from {available_transcripts[0].language_code} to English")
                                fetched_transcript = transcript_obj.fetch()
                            else:
                                raise NoTranscriptFound(f"No transcripts found for video {video_id}")
                    else:
                        raise NoTranscriptFound(f"No manual transcripts found for video {video_id}")
            
            # Process the fetched transcript
            if self.config.preserve_formatting:
                # Keep timestamps and formatting
                formatted_text = []
                for snippet in fetched_transcript:
                    timestamp = f"[{snippet.start:.1f}s]" if hasattr(snippet, 'start') else ""
                    formatted_text.append(f"{timestamp} {snippet.text}")
                return "\n".join(formatted_text)
            else:
                # Clean text joining - FetchedTranscript is iterable
                return " ".join(snippet.text.strip() for snippet in fetched_transcript if snippet.text.strip())
            
        except TranscriptsDisabled:
            raise ValueError(f"Transcripts are disabled for video ID {video_id}")
        except NoTranscriptFound as e:
            raise ValueError(f"No suitable transcript found for video ID {video_id}: {str(e)}")
        except CouldNotRetrieveTranscript as e:
            raise RuntimeError(f"Could not retrieve transcript for video ID {video_id}: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Unexpected error fetching transcript for video ID {video_id}: {str(e)}")
    
    def create_documents(self, 
                        video_url_or_id: str, 
                        metadata: Optional[Dict[str, Any]] = None) -> List[Document]:
        """
        Create LangChain Document objects from YouTube transcript.
        
        Args:
            video_url_or_id: YouTube URL or video ID
            metadata: Additional metadata to include in documents
            
        Returns:
            List of Document objects with transcript chunks
        """
        video_id = self.extract_video_id(video_url_or_id)
        transcript_text = self.fetch_transcript(video_url_or_id)
        
        # Prepare base metadata
        base_metadata = {
            'source': f'youtube_video_{video_id}',
            'video_id': video_id,
            'content_type': 'youtube_transcript',
            'chunk_size': self.config.chunk_size,
            'chunk_overlap': self.config.chunk_overlap
        }
        
        # Add custom metadata if provided
        if metadata:
            base_metadata.update(metadata)
        
        # Create documents with text splitting
        documents = self.text_splitter.create_documents(
            texts=[transcript_text],
            metadatas=[base_metadata]
        )
        
        # Add chunk-specific metadata
        for i, doc in enumerate(documents):
            doc.metadata.update({
                'chunk_index': i,
                'total_chunks': len(documents)
            })
        
        logger.info(f"Created {len(documents)} document chunks for video {video_id}")
        return documents
    
    def process_multiple_videos(self, 
                              video_urls_or_ids: List[str], 
                              metadata_list: Optional[List[Dict[str, Any]]] = None) -> List[Document]:
        """
        Process multiple videos and return combined document list.
        
        Args:
            video_urls_or_ids: List of YouTube URLs or video IDs
            metadata_list: Optional list of metadata dicts for each video
            
        Returns:
            Combined list of Document objects from all videos
        """
        all_documents = []
        
        for i, video_url_or_id in enumerate(video_urls_or_ids):
            try:
                video_metadata = metadata_list[i] if metadata_list and i < len(metadata_list) else None
                documents = self.create_documents(video_url_or_id, video_metadata)
                all_documents.extend(documents)
                logger.info(f"Successfully processed video {i+1}/{len(video_urls_or_ids)}")
            except Exception as e:
                logger.error(f"Failed to process video {video_url_or_id}: {e}")
                continue
        
        return all_documents

# Convenience functions for backward compatibility and simple usage
def extract_video_id(url_or_id: str) -> str:
    """Extract video ID from URL or return ID directly."""
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url_or_id)
    return match.group(1) if match else url_or_id

def fetch_transcript(video_url_or_id: str, preferred_langs: List[str] = None) -> str:
    """
    Simple function to fetch transcript using the latest API.
    """
    if preferred_langs is None:
        preferred_langs = ['en']
    
    video_id = extract_video_id(video_url_or_id)
    api = YouTubeTranscriptApi()
    
    try:
        # Try the simple fetch method first
        fetched_transcript = api.fetch(video_id, languages=preferred_langs)
        return " ".join(snippet.text for snippet in fetched_transcript)
        
    except NoTranscriptFound:
        # Fallback to list method with more control
        try:
            transcript_list = api.list(video_id)
            
            # Try manual transcript first
            try:
                transcript = transcript_list.find_transcript(preferred_langs)
            except NoTranscriptFound:
                # Try auto-generated
                transcript = transcript_list.find_generated_transcript(preferred_langs)
            
            fetched_transcript = transcript.fetch()
            return " ".join(snippet.text for snippet in fetched_transcript)
            
        except (TranscriptsDisabled, NoTranscriptFound):
            raise ValueError(f"No captions available for video ID {video_id}.")
    
    except Exception as e:
        raise RuntimeError(f"Failed to fetch transcript for video ID {video_id}: {e}")

def split_transcript(transcript: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
    """Split transcript into LangChain Document chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )
    return splitter.create_documents([transcript])
