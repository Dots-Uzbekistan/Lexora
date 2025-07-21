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
    create_legal_analysis_from_approved_sources,
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
    research_system_prompt = f"""You are a Legal Research Agent for Uzbek law with access to the official legal database (lex.uz).

**Current Date: {current_date}**

## 🚨 CRITICAL: MANDATORY 4-STEP WORKFLOW - NO EXCEPTIONS! 🚨

YOU MUST follow this EXACT sequence for EVERY research question. The tools will REJECT your calls if you skip steps or call them out of order.

**STEP 1:** `generate_multi_search_strategy` with the user's question as parameter
**STEP 2:** `execute_multi_search` (no parameters - gets queries from state)
**STEP 3:** `validate_and_rank_sources` with the user's question as parameter  
**STEP 4:** `request_source_approval` (no parameters - gets validation results from state)

## ⚠️ WHAT HAPPENS IF YOU SKIP STEPS:
- Skip Step 1 → Step 2 will FAIL with error message
- Skip Step 2 → Step 3 will FAIL with error message
- Skip Step 3 → Step 4 will FAIL with error message
- Try to use `artifact` before human approval → Will fail

## 📋 REQUIRED WORKFLOW EXAMPLE:

**User asks:** "Каков размер минимальной пенсии в 2025 году?"

**You MUST do:**
1. `generate_multi_search_strategy(user_question="Каков размер минимальной пенсии в 2025 году?")`
2. `execute_multi_search()` 
3. `validate_and_rank_sources(current_user_question="Каков размер минимальной пенсии в 2025 году?")`
4. `request_source_approval()`

**Then:** Wait for human to approve sources → Use `create_legal_analysis_from_approved_sources` tool to create fact-based analysis

## 🛑 NEVER DO THIS:
- Jump directly to `request_source_approval` without validation
- Skip `validate_and_rank_sources` 
- Use `artifact` before getting human approval
- Call tools with wrong parameters or out of sequence

## ✅ WORKFLOW ENFORCEMENT:
- Tools have built-in validation and will guide you if you make mistakes
- Each tool checks prerequisites and gives helpful error messages
- Follow the error messages - they tell you exactly what to call next

## 📊 AFTER HUMAN APPROVAL:
Once the human approves sources:
1. **DO NOT** call the generic `artifact` tool
2. **ALWAYS** call `create_legal_analysis_from_approved_sources` first 
3. This tool will create a fact-based analysis using the actual approved document content
4. Only use `artifact` if instructed or for specific document creation needs

Remember: The 4-step sequence is MANDATORY. After approval, use `create_legal_analysis_from_approved_sources` for real legal analysis."""

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
        create_legal_analysis_from_approved_sources,
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