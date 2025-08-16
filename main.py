import yaml
from src.data_ingestion import fetch_transcript, split_transcript
from src.embeddings import get_embeddings_model, create_vector_store
from src.retrieval import get_llm_model, get_prompt_template, build_chain

if __name__ == "__main__":
    # ----------------------------
    # Load config
    # ----------------------------
    with open('config/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    # ----------------------------
    # Fetch & split transcript
    # ----------------------------
    try:
        transcript = fetch_transcript(config['video_id'])
        print(f"Transcript length: {len(transcript)} characters")
    except Exception as e:
        print("Error fetching transcript:", e)
        exit(1)

    chunks = split_transcript(transcript, config['chunk_size'], config['chunk_overlap'])
    print(f"Created {len(chunks)} chunks")

    # ----------------------------
    # Embeddings
    # ----------------------------
    embeddings = get_embeddings_model(config['embeddings_model'])
    vector_store = create_vector_store(chunks, embeddings)

    # ----------------------------
    # Retrieval + LLM
    # ----------------------------
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": config['retriever_k']})
    llm = get_llm_model(config['llm_model'], config['temperature'], config['max_tokens'])
    prompt = get_prompt_template()
    chain = build_chain(retriever, llm, prompt)

    # ----------------------------
    # Example usage
    # ----------------------------
    question = "Is the topic of nuclear fusion discussed in this video? If yes, what was discussed?"
    answer = chain.invoke(question)
    print("Answer:", answer)

    summary = chain.invoke("Can you summarize the video?")
    print("Summary:", summary)