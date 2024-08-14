
var _ = require('lodash');


// Check All Rules of the RuleSet. If conditions are met, trigger the modifications
const applyRulesToCase = (ruleSet, caseModel, currentCase) => {
    let enhancedCase = _.clone(currentCase)
    let rulesFired = []
	for (let x of ruleSet){
		if ( checkConditions( x.conditions, enhancedCase) ){
            console.log("RULE "+x.ruleID+ " is fired")
            rulesFired.push(x.ruleID)
            enhancedCase = applyModifications (x.modifications, enhancedCase) 
        }
	}
	return {enhancedCase, rulesFired};
}

// Check the Conditions of a Rule for a Case
const checkConditions = (conditions, inputCase) => {
    for (let c of conditions){
        //console.log(" CHECKING CONDITION for "+c.attribute)
        if (c.operator === "equals"){
            if ( inputCase[c.attribute] !== c.value ){
                //console.log(" EQ CONDITION FAILED")
                return false
            }
        } else if (c.operator === "contains"){
            if (    inputCase[c.attribute].indexOf(c.value) <0  ){
                //console.log(" CN CONDITION FAILED")
                return false
            }
        }
    }
    //console.log(" RULE ACTIVATES")
    return true;

}

// Check the Modifications of a Rule to a Case
const applyModifications = (modifications, inputCase) => {
    let outputCase = _.clone(inputCase)
    for (let m of modifications){
        if (m.operator === "replace"){
            outputCase[m.attribute] = m.value
        } else if (m.operator === "add"){
            if (!outputCase.hasOwnProperty(m.attribute)) {
                outputCase[m.attribute] = []
            }   

            if (outputCase[m.attribute].indexOf(m.value)<0){
                outputCase[m.attribute].push(m.value)
            }
        } else if (m.operator === "remove"){
            if (!outputCase.hasOwnProperty(m.attribute)) {
                outputCase[m.attribute] = []
            }   
            let index = outputCase[m.attribute].indexOf(m.value)
            if (index>=0){
                outputCase[m.attribute].splice(index , index)
            }
        }
    }
    //console.log(" RULE HAS EXECUTED")
    return outputCase

}

module.exports = { applyRulesToCase}