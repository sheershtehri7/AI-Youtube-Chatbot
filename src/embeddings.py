from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def get_embeddings_model(model_name: str):
    return HuggingFaceEmbeddings(model_name=model_name)

def create_vector_store(chunks: list, embeddings):
    return FAISS.from_documents(chunks, embeddings)