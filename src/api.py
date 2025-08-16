from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from data_ingestion import fetch_transcript, split_transcript
from embeddings import get_embeddings_model, create_vector_store
from retrieval import get_llm_model, get_prompt_template, build_chain
import yaml
import uvicorn
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="YouTube Chatbot API", version="1.0.0")

# Enable CORS with specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "chrome-extension://*",  # Allow all Chrome extensions
        "http://localhost:*",    # Allow all localhost ports
        "https://www.youtube.com",
        "https://youtube.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Global variable for RAG chain
rag_chain = None
current_video_id = None

class ProcessRequest(BaseModel):
    video_id: str

class AskRequest(BaseModel):
    question: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "YouTube Chatbot API is running", "status": "healthy"}

@app.options("/process")
async def options_process():
    """Handle preflight requests for /process"""
    return JSONResponse(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

@app.post("/process")
async def process_video(request: ProcessRequest):
    """Process a YouTube video for chatbot functionality"""
    global rag_chain, current_video_id
    
    try:
        logger.info(f"Processing video: {request.video_id}")
        
        # Load configuration
        try:
            with open('config/config.yaml', 'r') as f:
                config = yaml.safe_load(f)
        except FileNotFoundError:
            # Use default configuration if file not found
            config = {
                'chunk_size': 1000,
                'chunk_overlap': 200,
                'embeddings_model': 'text-embedding-ada-002',
                'retriever_k': 3,
                'llm_model': 'gpt-3.5-turbo',
                'temperature': 0.7,
                'max_tokens': 500
            }
            logger.warning("Config file not found, using default configuration")

        # Fetch and process transcript
        logger.info("Fetching transcript...")
        transcript = fetch_transcript(request.video_id)
        
        if not transcript:
            raise HTTPException(status_code=400, detail="Could not fetch transcript for this video")
        
        logger.info("Splitting transcript into chunks...")
        chunks = split_transcript(transcript, config['chunk_size'], config['chunk_overlap'])
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not process transcript into chunks")

        # Create embeddings and vector store
        logger.info("Creating embeddings...")
        embeddings = get_embeddings_model(config['embeddings_model'])
        vector_store = create_vector_store(chunks, embeddings)

        # Create retriever and chain
        logger.info("Setting up retrieval chain...")
        retriever = vector_store.as_retriever(
            search_type="similarity", 
            search_kwargs={"k": config['retriever_k']}
        )
        llm = get_llm_model(config['llm_model'], config['temperature'], config['max_tokens'])
        prompt = get_prompt_template()
        rag_chain = build_chain(retriever, llm, prompt)
        
        current_video_id = request.video_id
        
        logger.info(f"Successfully processed video: {request.video_id}")
        return {
            "status": "success", 
            "message": f"Processed video {request.video_id}",
            "chunks_created": len(chunks)
        }
        
    except Exception as e:
        logger.error(f"Error processing video {request.video_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@app.options("/ask")
async def options_ask():
    """Handle preflight requests for /ask"""
    return JSONResponse(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

@app.post("/ask")
async def ask_question(request: AskRequest):
    """Ask a question about the processed video"""
    global rag_chain
    
    if rag_chain is None:
        raise HTTPException(
            status_code=400, 
            detail="No video processed yet. Please call /process endpoint first."
        )
    
    try:
        logger.info(f"Answering question: {request.question}")
        answer = rag_chain.invoke(request.question)
        
        logger.info("Successfully generated answer")
        return {"answer": answer}
        
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")

@app.get("/status")
async def get_status():
    """Get the current status of the API"""
    return {
        "status": "running",
        "video_processed": current_video_id is not None,
        "current_video_id": current_video_id,
        "chain_ready": rag_chain is not None
    }

# Exception handler for CORS
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 8000))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    logger.info(f"Starting YouTube Chatbot API on {host}:{port}")
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        log_level="info"
    )