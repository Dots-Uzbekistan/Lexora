import os
from datetime import datetime

from dotenv import load_dotenv
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from app.schemas.research_state import LegalResearchState
from app.core.configuration import LegalAgentConfiguration
from app.tools.research_tools import (
    generate_multi_search_strategy,
    execute_multi_search,
    validate_and_rank_sources,
    request_source_approval,
    artifact
)

load_dotenv()


def create_research_agent():
    """Create a legal research agent with multi-query search and human approval workflow"""
    
    # Initialize configuration
    config = LegalAgentConfiguration()
    
    # Get current date for system prompt
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Research agent system prompt
    research_system_prompt = f"""You are a Legal Research Agent for Uzbek law. ALWAYS follow this exact sequence:

**Current Date: {current_date}**

## MANDATORY TOOL SEQUENCE:

For every research question, call these tools in EXACT order:

**1. FIRST:** Call `generate_multi_search_strategy` with user question
**2. SECOND:** Call `execute_multi_search` (no parameters needed)  
**3. THIRD:** Call `validate_and_rank_sources` with user question
**4. FOURTH:** Call `request_source_approval` (no parameters needed)

DO NOT SKIP ANY STEP. DO NOT CALL TOOLS OUT OF ORDER.

After step 4, wait for human approval, then use `artifact` tool.

## Example Usage:
User: "сколько составляет минимальная пенсия в узбекистане"
1. Call `generate_multi_search_strategy` with this question
2. Call `execute_multi_search` 
3. Call `validate_and_rank_sources` with this question  
4. Call `request_source_approval`
5. Wait for human to approve sources
6. Use `artifact` to create legal analysis

CRITICAL: Always call `validate_and_rank_sources` BEFORE `request_source_approval`!"""

    # Initialize the model  
    model = ChatOpenAI(
        model=config.reasoning_model,
        reasoning_effort="low",
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Research workflow tools
    tools = [
        generate_multi_search_strategy,
        execute_multi_search,
        validate_and_rank_sources,
        request_source_approval,
        artifact
    ]
    
    # Create the react agent
    graph = create_react_agent(
        model=model,
        tools=tools,
        state_schema=LegalResearchState,
        prompt=research_system_prompt
    )
    
    return graph


# Create the graph instance for API use
graph = create_research_agent()


if __name__ == "__main__":
    # Test the research agent locally
    config = {"configurable": {"thread_id": "research_test"}}
    
    result = graph.invoke(
        {"messages": [HumanMessage(content="Каковы основания для увольнения работника по инициативе работодателя?")]},
        config=config
    )
    
    print("Research Agent response:")
    print(result["messages"][-1].content)