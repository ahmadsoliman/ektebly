from openai import OpenAI
import os

class SummarizationService:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    async def summarize(self, transcript: str) -> str:
        """Summarizes the transcript using OpenAI GPT-4"""
        try:
            prompt = f"""
            Summarize the following Arabic/English transcript of a meeting into key points and action items in egyptian arabic, but don't translate english words, use them as they are:
            {transcript}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Summarization failed: {str(e)}")
