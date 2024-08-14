
var _ = require('lodash');

const dataFolder = './data/'

// IMPORT JSON MODEL DATA
const caseModel       = require (dataFolder+'case-model.json') 
const ruleSet         = require (dataFolder+'rule-set.json') 
const ontologyTree    = require (dataFolder+'ontology-tree.json') 
const petriNet        = require (dataFolder+'petri-net.json') 
// IMPORT CASE DATABASE
const caseDataset     = require (dataFolder+'case-dataset.json') 
// IMPORT TEST CASE  
const inputCase       = require (dataFolder+'input-case.json') 
// IMPORT SERVICE LIBRARIES
const rbrService = require('./lib/rbrService');
const cbrService = require('./lib/cbrService');
const treeService = require('./lib/treeService');
const petrinetService = require('./lib/petrinetService');



function runHybridSystem( model = caseModel, rules = ruleSet, ontology = ontologyTree, dataset = caseDataset, petri = petriNet, input = inputCase){


    console.log ("[INITIAL CASE]")
    console.log (input)
    let currentCase = _.clone(input) ;
    
    console.log ("-------------------")
    // STEP 1 : USE RBR TO EXTEND THE CASE
    console.log ("[STEP1 - RBR]")

    console.log(rules)
    let rbrResults= rbrService.applyRulesToCase(rules, model, currentCase);
    const rbrEnhancedCase = rbrResults.enhancedCase
    const rulesFired = rbrResults.rulesFired
    console.log (rbrEnhancedCase)
    
    
    console.log ("-------------------")
    // STEP 2 : USE CBR TO ADD OUTPUT VALUES
    console.log ("[STEP2 - CBR]")
    
    // We Run CBR and get the SortedSimilarities for Each Case


    
    let sortedSimilarCases = cbrService.runCaseBasedReasoning(dataset, model, rbrEnhancedCase, ontology)
    
    console.log(sortedSimilarCases)
    
    // We only Select 2 Cases as the most Similar
    let numberOfCases = 2;
    const selectedCases = sortedSimilarCases.slice(0, numberOfCases);
    
    let outPutFeatures = _.filter(model, {"output": true})
    let cbrEnhancedCase = _.clone(rbrEnhancedCase) ;
    for (let s of selectedCases){
        console.log("CASE "+s.caseId+ " is used")
        let selCase = _.find(dataset, {"caseId": s.caseId});
        for (let feature of outPutFeatures){
            cbrEnhancedCase = cbrService.transferValues(cbrEnhancedCase, selCase.features, feature)
        }
    }
    console.log ("-------------------")
    console.log (cbrEnhancedCase)
    
    console.log ("-------------------")
    // STEP 3 : USE PETRI NET MODEL 
    console.log ("[STEP3 - PROCESS MINING]")
    let petrinetEnhancedCase =  JSON.parse(JSON.stringify(cbrEnhancedCase))
    console.log (cbrEnhancedCase)
    
    let petrinetResult = petrinetService.runPetriNet( petri , model, petrinetEnhancedCase)

    petrinetEnhancedCase = petrinetResult.enhancedCase

    let transitionsHistory = petrinetResult.transitionsHistory

    
    console.log ("-------------------")
    console.log("FINAL CASE OBJ:")
    console.log (petrinetEnhancedCase)

    let output = {
        "inputCase" : inputCase,
        "rbrEnhancedCase"    : rbrEnhancedCase ,
        "rulesFired"         : rulesFired ,
        "selectedCases"         : selectedCases , 
        "sortedSimilarCases" : sortedSimilarCases ,
        "cbrEnhancedCase"    : cbrEnhancedCase,
        "petrinetEnhancedCase"   : petrinetEnhancedCase , 
        "transitionsHistory"     : transitionsHistory
    }

    return output

}

// let results = runHybridSystem(null,null,null,null,null,null)


// console.log(results)

module.exports = {runHybridSystem}