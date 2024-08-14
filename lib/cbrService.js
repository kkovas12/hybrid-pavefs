

var _ = require('lodash');
const treeService = require('./treeService');

// Trensfer Values of a feature from a case to another
const transferValues = (currentCase, selCase, feature) => {
    let enhancedCase = _.clone(currentCase)
    let attribute = feature.attribute

    if (feature.attributeType === "SET" || feature.attributeType === "SET-TREE"){
        if (!enhancedCase.hasOwnProperty(attribute)){
            enhancedCase[attribute] = []
        }
        // Add All New Values
        for (let v of selCase[attribute]){
             if ( enhancedCase[attribute].indexOf(v)<0 )  {
                enhancedCase[attribute].push(v)
             } 
        }
    } else  {
        // The Value is only added if there is not already a value
        if (!enhancedCase.hasOwnProperty(attribute)){
            enhancedCase[attribute] = selCase[attribute]
        }
    }
    return enhancedCase;
}

// Perform CBR to retrieve the most sililar cases (sorted by similarity)
const runCaseBasedReasoning = (caseDataset, caseModel, currentCase, tree) => {
    let smililarityPerCase = []	
    for (let c of caseDataset){
		let similarity = compareCase(c.features , currentCase , caseModel , tree )
		smililarityPerCase.push ({
			"caseId" : c.caseId,
			"similarity" : parseFloat(similarity.avgSimilarity.toFixed(2)),
            "details" : similarity.comparisonDetails
		})
    }

    return _.orderBy(smililarityPerCase, ["similarity"],["desc"]);

}

const compareCase = ( targetCase , inputCase , caseModel ,tree ) => {
    let totalSimilarity = 0

    let comparisonDetails = {}
    for (let f of caseModel){
        let thisSimilarity = compareFeature ( targetCase[f.attribute], inputCase[f.attribute] , f , tree)
        //console.log(f.attribute+" "+thisSimilarity)
        comparisonDetails[f.attribute] = parseFloat(thisSimilarity.toFixed(2))
        //console.log("SIMILARITY FOR "+f.attribute+" ->"+thisSimilarity)
        totalSimilarity+= (thisSimilarity * f.weight)
    }
    let avgSimilarity = totalSimilarity / 100


    return {avgSimilarity,comparisonDetails};

}

const compareFeature = (t , i , f, tree) =>{
    if (f.attributeType === "BOOLEAN"){
        return booleanDistance(t,i)
    } else if (f.attributeType === "NUMERIC"){
        return  normalizedDistance(t , i, f.minValue , f.maxValue) 
    } else if (f.attributeType === "CATEGORICAL"){
        return eskinSimilarity(t,i, f.classes.length)
    } else if (f.attributeType === "CATEGORICAL-TREE"){
        return treeService.treeSimilarity(t,i, f.branchRoot, tree)
    } else if (f.attributeType === "SET"){
        return multivalueSimilarity(t,i,f.classes.length)
    } else if (f.attributeType === "SET-TREE"){
        return 1;

    }


}

const booleanDistance = (a,b) => {
    return ( a === b )? 1 : 0 ;
}

const normalizedDistance = ( a , b , min , max ) => {
    //console.log( [a , b , min , max ] )
     return 1 - Math.abs(  (b-a) / (max-min)  ) 
}

const eskinSimilarity = ( a , b , n) => {
    if ( a === b){
        return 1;
    } else {
        let n_sqr = n * n
        return n_sqr / (n_sqr+2)
    }
}

const multivalueSimilarity = ( set1, set2 ,total) => {
    let compareData = compareSets(set1 , set2, total)

    let similarity = estimateSimilarity(compareData.a, compareData.b,compareData.c)

    return similarity.jaccard
}

// Generate a,b,c,d values from two sets that are compared
function compareSets(first , second, total){
    if (!first){
        first = []
    } 

    if (!second){
        second = []
    }

    let a = first.filter(value => second.includes(value))
    let b = first.filter( value => a.indexOf( value ) < 0 )
    let c = second.filter( value => a.indexOf( value ) < 0 )
  
    return {
      "a" : a.length,  
      "b" : b.length,
      "c" : c.length,
      "d" : total - (a.length + b.length + c.length),
      "common" : a,
      "firstOnly" : b ,
      "secondOnly" : c
    }
}

function estimateSimilarity(a , b , c){

    let obj = {}
    let sum = a + b + c
    obj.jaccard     =  (sum === 0) ? 1.00 :  parseFloat((a / sum).toFixed(2))
    obj.sorensen    =  (sum === 0) ? 1.00 :  parseFloat(((2 * a) / (a+sum) ))
    obj.otsuka      =  (sum === 0) ? 1.00 :  parseFloat((a /  Math.sqrt( (a+b)*(a+c) ) ).toFixed(2))
    obj.braun       =  (sum === 0) ? 1.00 :  parseFloat((a /  Math.max( (a+b),(a+c) ) ).toFixed(2))
    obj.simpson     =  (sum === 0) ? 1.00 :  parseFloat((a /  Math.min( (a+b),(a+c) ) ).toFixed(2))
    obj.sokal       =  (sum === 0) ? 1.00 :  parseFloat((a /  (sum + b + c)).toFixed(2))
    obj.kulcz       =  (sum === 0) ? 1.00 :  parseFloat((0.5 *  (  a/(a+b) + a/(a+c) )).toFixed(2))

    return obj

}

module.exports = {runCaseBasedReasoning , transferValues}