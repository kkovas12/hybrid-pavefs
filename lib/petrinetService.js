
var _ = require('lodash');

let runPetriNet  = (petriNet , caseModel ,inputCase) =>{

    let enhancedCase = _.clone(inputCase)

    let caseNodes = case2Nodes(enhancedCase)
    console.log(caseNodes)

    // Create an instance of the PetriNet class
    const myPetriNet = new PetriNet(petriNet);

    const petrinetResult = myPetriNet.execute(caseNodes);
    
    const outputPlaces = petrinetResult.outputPlaces

    const transitionsHistory = petrinetResult.transitionsHistory

    for (let output of outputPlaces){
        const items = output.split(':');
        let attributeName = items[0];
        let value    = items[1];

        let attributeObj = _.find(caseModel, {"attribute":attributeName} )

        if (attributeObj.attributeType === "SET" || attributeObj.attributeType === "SET-TREE"){
            if (enhancedCase[attributeName].indexOf(value)<0){
              enhancedCase[attributeName].push(value)
            }
        } else {
            if (!enhancedCase.hasOwnProperty(attributeName) ||  !enhancedCase[attributeName]){
              enhancedCase[attributeName] = value
            }
        }

    }



    return {enhancedCase , transitionsHistory};
}

let case2Nodes = (caseObj) =>{
    let nodes = []
    for (const [key, value] of Object.entries(caseObj)) {
        if (Array.isArray(value)){
            for (let v of value){
                nodes.push (key+":"+v)
            }
        } else {
            nodes.push (key+":"+value)
        }
    }
    return nodes
}

class PetriNet {
  constructor(petriNet) {
    this.places = petriNet.places;
    this.transitions = petriNet.transitions;
  }

  execute(caseValues) {
    // Create a copy of the places to track their token counts
    const placesCopy = JSON.parse(JSON.stringify(this.places));

    let sourceNodes = []
    let outputNodes = []

    let transitionsHistory = []

    // Initialize the marking with the case values
    const marking = {};
    for (const place of placesCopy) {
      // Add Place in Sources or Exits  
      if (place.type === "source") {
        sourceNodes.push(place.id)
      } else if (place.type === "exit"){
        outputNodes.push(place.id)
      }

      if (caseValues.includes(place.id) && place.type ==="source") { // Put a Token in Source Places that are included in the Case.
        console.log("INITIAL TOKEN IS PLACED IN : "+place.id)
        marking[place.id] = 1;
      } else {
        marking[place.id] = 0;
      }
    }
    //console.log(marking)
    // Execute transitions until no enabled transitions remain
    let enabledTransitions = this.getEnabledTransitions(marking);
    //console.log("TRANSITIONS: "+JSON.stringify(enabledTransitions))
    while (enabledTransitions.length > 0) {
      const transition = enabledTransitions[0];
      for (const input of transition.inputs) {
        marking[input]--;
      }
      for (const output of transition.outputs) {
        if ( caseValues.includes( output ) || outputNodes.includes(output) ){
            transitionsHistory.push(transition.label)
            console.log("TOKEN IS TRANSFERED IN : "+output)
            marking[output]++;
        }
      }
      //console.log(marking)
      enabledTransitions = this.getEnabledTransitions(marking);
      //console.log("TRANSITIONS: "+JSON.stringify(enabledTransitions))
    }

    // Find the places with marking equal to 1 and return their ids
    const outputPlaces = [];
    for (const place of placesCopy) {
      if (marking[place.id] === 1 && place.type === 'exit') {
        console.log("OUTPUT VALUE : "+place.id)
        outputPlaces.push(place.id);
      }
    }

    return {outputPlaces, transitionsHistory};
  }

  getEnabledTransitions(marking) {
    const enabledTransitions = [];
    for (const transition of this.transitions) {
      let isEnabled = true;
      for (const input of transition.inputs) {
        if (marking[input] === 0) {
          isEnabled = false;
          break;
        }
      }
      if (isEnabled) {
        enabledTransitions.push(transition);
      }
    }
    return enabledTransitions;
  }
}

module.exports = {runPetriNet}