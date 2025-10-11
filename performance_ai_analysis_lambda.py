import json
import boto3
import logging
from typing import Dict, List, Any
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    """
    AWS Lambda handler to generate AI analysis of waste data using Nova Pro
    
    Expected body parameters:
    - waste_data: The waste analysis data from the previous Lambda
    - analysis_type: Type of analysis requested (optional, defaults to 'comprehensive')
    """
    
    try:
        # Parse the request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        waste_data = body.get('waste_data', {})
        analysis_type = body.get('analysis_type', 'comprehensive')
        
        logger.info(f"Generating AI analysis for waste data with {len(waste_data.get('waste_analysis', []))} months of data")
        
        # Generate AI insights using Nova Pro
        ai_insights = generate_ai_insights(waste_data, analysis_type)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            'body': json.dumps({
                'ai_insights': ai_insights,
                'analysis_timestamp': datetime.now().isoformat(),
                'analysis_type': analysis_type
            })
        }
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }

def generate_ai_insights(waste_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
    """
    Generate comprehensive AI insights using Amazon Nova Pro
    """
    
    try:
        # Prepare the data summary for AI analysis
        waste_analysis = waste_data.get('waste_analysis', [])
        summary = waste_data.get('summary', {})
        
        # Create a comprehensive prompt for Nova Pro
        prompt = create_analysis_prompt(waste_analysis, summary, analysis_type)
        
        # Call Nova Pro through Bedrock
        ai_response = call_nova_pro(prompt)
        
        # Parse and structure the AI response
        structured_insights = structure_ai_response(ai_response, waste_analysis, summary)
        
        return structured_insights
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        raise

def create_analysis_prompt(waste_analysis: List[Dict], summary: Dict, analysis_type: str) -> str:
    """
    Create a comprehensive prompt for Nova Pro analysis
    """
    
    # Convert data to readable format with 3D feature impact analysis
    data_summary = f"""
    SMART KITCHEN WASTE MANAGEMENT - 3D FEATURE ANALYSIS:
    
    Monthly Performance with Feature Impact:
    """
    
    for month_data in waste_analysis:
        active_features = month_data.get('activeFeatures', [])
        feature_status = ' + '.join(active_features) if active_features else 'No features active'
        savings_pct = month_data.get('savingsPercentage', 0)
        
        data_summary += f"""
    • {month_data['month']}: Food Cost: RM {month_data['foodCost']:,}, Waste: {month_data['wastePercentage']}% (Features: {feature_status}, Savings: {savings_pct}%)
    """
    
    # Add 3D Feature Impact Analysis
    if waste_analysis:
        latest_month = waste_analysis[-1]
        feature_impact = latest_month.get('savings', {}).get('feature_impact', {})
        
        data_summary += f"""
    
    3D WASTE MANAGEMENT FEATURES IMPACT:
    • Dynamic Menu System: {feature_impact.get('dynamic_menu', 0)}% waste reduction (AI-powered menu optimization)
    • Discount System: {feature_impact.get('discount_system', 0)}% waste reduction (Smart pricing for near-expiry items)
    • Donation Program: {feature_impact.get('donation_program', 0)}% waste reduction (Automated surplus redistribution)
    • Total Combined Impact: {sum(feature_impact.values())}% waste reduction from baseline
    
    Overall Performance Summary:
    • Average Monthly Food Cost: RM {summary.get('avg_monthly_cost', 0):,}
    • Current Waste Rate: {summary.get('current_waste_rate', 0)}% (Industry baseline: 8.5%)
    • Monthly Savings Achieved: RM {summary.get('current_month_savings', 0):,.0f}
    • Performance Status: {summary.get('performance_status', 'Unknown')}
    • Performance Trend: {summary.get('performance_trend', 'Unknown')}
    • Total Items Analyzed: {summary.get('total_items_analyzed', 0)}
    • Analysis Period: {summary.get('date_range', {}).get('start', 'N/A')} to {summary.get('date_range', {}).get('end', 'N/A')}
    
    TARGET: Maximize 3D feature synergy to achieve <3% waste rate
    """
    
    if analysis_type == 'comprehensive':
        prompt = f"""
        You are an expert AI restaurant analyst specializing in smart waste management systems. Analyze this 3D feature implementation data and provide clear, actionable insights.
        
        {data_summary}
        
        IMPORTANT: Focus on the synergy between Dynamic Menu, Discount System, and Donation Program. Keep sections brief and impactful for dashboard display.
        
        Provide analysis in this exact structure:
        
        **EXECUTIVE SUMMARY**
        • [Key insight about 3D feature performance with specific metric]
        • [Waste reduction trend with percentage improvement]
        • [Strategic opportunity for feature optimization]
        
        **3D FEATURE IMPACT ANALYSIS**
        • Dynamic Menu Performance: [Effectiveness and optimization potential]
        • Discount System Results: [Impact on near-expiry waste reduction]
        • Donation Program Success: [Surplus redistribution efficiency]
        • Feature Synergy: [How the 3 features work together]
        
        **PERFORMANCE STATUS**
        • Current vs Baseline: [Specific comparison to 8.5% industry standard]
        • Feature Maturity: [Assessment of implementation stage]
        • Cost Efficiency: [RM impact and operational benefits]
        
        **OPTIMIZATION OPPORTUNITIES**
        • [Top opportunity for feature enhancement]
        • [Second opportunity with expected impact]
        • [Cross-feature synergy improvement]
        
        **IMMEDIATE ACTIONS**
        • [Priority 1: Specific 3D feature optimization]
        • [Priority 2: Data collection or system adjustment]
        • [Priority 3: Performance monitoring requirement]
        
        Keep each bullet point to 1-2 sentences max. Use specific numbers from the data. Focus on maximizing the 3D feature ecosystem performance.
        """
    else:
        prompt = f"""
        You are a restaurant operations expert. Analyze this waste data and provide key insights:
        
        {data_summary}
        
        Provide:
        1. Current performance assessment
        2. Top 3 concerns or opportunities
        3. Immediate recommended actions
        
        Keep response concise and focused on actionable insights.
        """
    
    return prompt

def call_nova_pro(prompt: str) -> str:
    """
    Call Amazon Nova Pro through Bedrock Runtime
    """
    
    try:
        # Nova Pro model configuration
        model_id = "amazon.nova-pro-v1:0"
        
        # Prepare the correct message format for Nova Pro converse API
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
        
        # Inference configuration
        inference_config = {
            "maxTokens": 4000,
            "temperature": 0.3,
            "topP": 0.9
        }
        
        # Make the request to Nova Pro
        response = bedrock_runtime.converse(
            modelId=model_id,
            messages=messages,
            inferenceConfig=inference_config
        )
        
        # Extract the generated text
        ai_response = response['output']['message']['content'][0]['text']
        
        logger.info(f"Successfully generated AI insights using Nova Pro (length: {len(ai_response)} characters)")
        return ai_response
        
    except Exception as e:
        logger.error(f"Error calling Nova Pro: {str(e)}")
        # Fallback to structured analysis if AI fails
        return generate_fallback_analysis(prompt)

def generate_fallback_analysis(prompt: str) -> str:
    """
    Generate fallback analysis focused on 3D features if Nova Pro is unavailable
    """
    return """
    SMART KITCHEN 3D WASTE MANAGEMENT ANALYSIS
    
    Based on your waste management system performance:
    
    🎯 EXECUTIVE SUMMARY
    • 3D feature ecosystem shows promising waste reduction potential
    • Dynamic Menu, Discount, and Donation systems working in synergy
    • Opportunity to optimize feature integration for maximum impact
    
    📊 3D FEATURE IMPACT ANALYSIS
    • Dynamic Menu Performance: AI-powered menu optimization reducing overproduction
    • Discount System Results: Smart pricing minimizing near-expiry waste
    • Donation Program Success: Automated surplus redistribution improving efficiency
    • Feature Synergy: Combined impact exceeding individual feature benefits
    
    💡 IMMEDIATE ACTIONS
    • Fine-tune Dynamic Menu prediction algorithms for seasonal variations
    • Optimize Discount System pricing thresholds for maximum uptake
    • Expand Donation Program partnerships for broader impact
    
    📈 OPTIMIZATION OPPORTUNITIES
    • Enhance cross-feature data sharing for better predictions
    • Implement real-time feature performance monitoring
    • Develop predictive analytics for proactive waste prevention
    
    Note: This is a fallback analysis. For detailed AI insights powered by Amazon Nova Pro, please ensure proper configuration.
    """

def structure_ai_response(ai_response: str, waste_analysis: List[Dict], summary: Dict) -> Dict[str, Any]:
    """
    Structure the AI response into a format suitable for the frontend
    """
    
    try:
        # Calculate some additional metrics for the structured response
        current_month = waste_analysis[-1] if waste_analysis else {}
        previous_month = waste_analysis[-2] if len(waste_analysis) > 1 else {}
        
        # Trend calculation
        trend_direction = "stable"
        trend_percentage = 0
        
        if current_month and previous_month:
            current_waste = current_month.get('wastePercentage', 0)
            previous_waste = previous_month.get('wastePercentage', 0)
            
            if previous_waste > 0:
                trend_percentage = ((current_waste - previous_waste) / previous_waste) * 100
                
            if trend_percentage > 5:
                trend_direction = "increasing"
            elif trend_percentage < -5:
                trend_direction = "decreasing"
        
        # Use consistent current waste rate from summary
        current_waste_rate = summary.get('current_waste_rate', current_month.get('rollingAvgWastePct', current_month.get('wastePercentage', 0)))
        
        # Structure the response
        structured_response = {
            "analysis_text": ai_response,
            "key_metrics": {
                "current_waste_rate": current_waste_rate,
                "target_waste_rate": 5.0,
                "monthly_avg_cost": summary.get('rolling_avg_monthly_cost', summary.get('avg_monthly_cost', 0)),
                "trend_direction": trend_direction,
                "trend_percentage": round(trend_percentage, 1),
                "performance_status": summary.get('performance_status', 'Unknown')
            },
            "quick_insights": extract_quick_insights(ai_response),
            "recommendations": extract_recommendations(ai_response),
            "risk_level": calculate_risk_level(current_waste_rate),  # Use current waste rate, not average
            "savings_potential": calculate_savings_potential(waste_analysis, summary),
            "data_quality_score": calculate_data_quality_score(waste_analysis, summary)
        }
        
        return structured_response
        
    except Exception as e:
        logger.error(f"Error structuring AI response: {str(e)}")
        return {
            "analysis_text": ai_response,
            "key_metrics": {
                "current_waste_rate": 0,
                "target_waste_rate": 5.0,
                "performance_status": "Unknown"
            },
            "quick_insights": ["Analysis generated successfully"],
            "recommendations": ["Review AI analysis for detailed recommendations"],
            "risk_level": "medium"
        }

def extract_quick_insights(ai_response: str) -> List[str]:
    """Extract key insights from AI response, focusing on 3D feature performance and executive summary"""
    
    insights = []
    
    # Look for executive summary and 3D feature analysis sections
    lines = ai_response.split('\n')
    in_executive_section = False
    in_3d_feature_section = False
    
    for line in lines:
        line = line.strip()
        
        # Check for section headers
        if "EXECUTIVE SUMMARY" in line.upper():
            in_executive_section = True
            in_3d_feature_section = False
            continue
        elif "3D FEATURE" in line.upper() or "FEATURE IMPACT" in line.upper():
            in_executive_section = False
            in_3d_feature_section = True
            continue
        elif line.startswith("**") and line.endswith("**"):
            in_executive_section = False
            in_3d_feature_section = False
            continue
        
        # Extract insights from relevant sections
        if (in_executive_section or in_3d_feature_section) and line.startswith('•'):
            insight = line[1:].strip()
            if len(insight) > 15 and len(insight) < 130:  # Reasonable length for GUI
                insights.append(insight)
    
    # Fallback: Look for any bullet points if no structured sections found
    if not insights:
        for line in lines:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                insight = line[1:].strip()
                if len(insight) > 15 and len(insight) < 130:
                    insights.append(insight)
    
    # Default insights focused on 3D features if nothing found
    if not insights:
        if "dynamic" in ai_response.lower() or "menu" in ai_response.lower():
            insights.append("Dynamic Menu system optimization analyzing performance")
        if "discount" in ai_response.lower():
            insights.append("Discount system reducing near-expiry item waste")
        if "donation" in ai_response.lower():
            insights.append("Donation program maximizing surplus food redistribution")
        if "feature" in ai_response.lower():
            insights.append("3D feature synergy improving overall waste management")
    
    return insights[:4]  # Limit to 4 concise insights for better GUI display

def extract_recommendations(ai_response: str) -> List[str]:
    """Extract actionable recommendations from AI response, focusing on 3D feature optimization"""
    
    recommendations = []
    
    # Look for immediate actions and optimization opportunities sections
    lines = ai_response.split('\n')
    in_immediate_actions = False
    in_optimization = False
    
    for line in lines:
        line = line.strip()
        
        # Check for section headers
        if "IMMEDIATE ACTIONS" in line.upper():
            in_immediate_actions = True
            in_optimization = False
            continue
        elif "OPTIMIZATION" in line.upper():
            in_immediate_actions = False
            in_optimization = True
            continue
        elif line.startswith("**") and line.endswith("**"):
            in_immediate_actions = False
            in_optimization = False
            continue
        
        # Extract from immediate actions first (priority)
        if in_immediate_actions and line.startswith('•'):
            rec = line[1:].strip()
            if len(rec) > 10 and len(rec) < 110:  # GUI-friendly length
                recommendations.append(rec)
        # Then from optimization opportunities if needed
        elif in_optimization and line.startswith('•') and len(recommendations) < 4:
            rec = line[1:].strip()
            if len(rec) > 10 and len(rec) < 110:
                recommendations.append(rec)
    
    # Fallback: Look for 3D feature related actionable content
    if not recommendations:
        for line in lines:
            line = line.strip()
            if line.startswith('•') and any(word in line.lower() for word in ['dynamic', 'discount', 'donation', 'optimize', 'enhance', 'improve', 'monitor']):
                rec = line[1:].strip()
                if len(rec) > 10 and len(rec) < 110:
                    recommendations.append(rec)
                    if len(recommendations) >= 4:
                        break
    
    # Default recommendations focused on 3D features if nothing found
    if not recommendations:
        recommendations = [
            "Optimize Dynamic Menu algorithm for better demand prediction",
            "Fine-tune Discount System pricing for maximum waste reduction",
            "Expand Donation Program partnerships for surplus redistribution",
            "Monitor 3D feature synergy for continuous improvement"
        ]
    
    return recommendations[:4]  # Limit to 4 for cleaner GUI display

def calculate_risk_level(current_waste_rate: float) -> str:
    """Calculate risk level based on current waste percentage"""
    
    if current_waste_rate < 3:
        return "Low"
    elif current_waste_rate < 5:
        return "Medium"
    elif current_waste_rate < 8:
        return "High"
    else:
        return "Critical"

def calculate_savings_potential(waste_analysis: List[Dict], summary: Dict) -> Dict[str, float]:
    """Calculate potential savings if waste is reduced"""
    
    current_waste_rate = summary.get('current_waste_rate', 0)
    avg_monthly_cost = summary.get('avg_monthly_cost', 0)
    
    # Calculate savings potential if waste is reduced to 3%
    target_waste_rate = 3.0
    
    if current_waste_rate > target_waste_rate and avg_monthly_cost > 0:
        current_waste_cost = (current_waste_rate / 100) * avg_monthly_cost
        target_waste_cost = (target_waste_rate / 100) * avg_monthly_cost
        
        monthly_savings = current_waste_cost - target_waste_cost
        annual_savings = monthly_savings * 12
        
        return {
            "monthly_potential": round(monthly_savings, 2),
            "annual_potential": round(annual_savings, 2),
            "percentage_reduction": round(((current_waste_rate - target_waste_rate) / current_waste_rate) * 100, 1)
        }
    
    return {
        "monthly_potential": 0,
        "annual_potential": 0,
        "percentage_reduction": 0
    }

def calculate_data_quality_score(waste_analysis: List[Dict], summary: Dict) -> int:
    """Calculate data quality score out of 100"""
    
    score = 0
    
    # Check if we have sufficient data points
    if len(waste_analysis) >= 6:
        score += 30
    elif len(waste_analysis) >= 3:
        score += 20
    elif len(waste_analysis) >= 1:
        score += 10
    
    # Check data completeness
    complete_records = sum(1 for record in waste_analysis 
                          if record.get('foodCost', 0) > 0 and 
                             record.get('wastePercentage', 0) >= 0)
    
    if complete_records == len(waste_analysis):
        score += 40
    elif complete_records >= len(waste_analysis) * 0.8:
        score += 30
    elif complete_records >= len(waste_analysis) * 0.5:
        score += 20
    else:
        score += 10
    
    # Check for recent data
    if summary.get('total_items_analyzed', 0) > 0:
        score += 30
    
    return min(score, 100)