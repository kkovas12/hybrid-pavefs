import { useRef, useState , useEffect, Fragment} from 'react';
//import { useForm } from 'react-hook-form';
import { useForm } from '@mantine/form';

import * as yup from 'yup';

import _ from 'lodash'

import Link from 'next/link';

import caseDataset from "../data/case-dataset.json"
import caseModel from "../data/case-model.json"
import ruleSet from "../data/rule-set.json"
import ontologyTree from "../data/ontology-tree.json"
import petriNet from "../data/petri-net.json"
import inputCase from "../data/input-case.json"

import { JsonInput, Table, Tooltip, Paper,  Progress, Card, NumberInput, NativeSelect , Divider, Text, Center , Chip ,Accordion ,Stack, Space, HoverCard, Checkbox, Button ,Grid, Skeleton, Container, Group, Box, Badge } from '@mantine/core';
// import { useClipboard } from '@mantine/hooks';
// import { IconCopy, IconCheck } from '@tabler/icons-react';

import { useRouter } from 'next/router';

const schema = yup.object().shape({
  options: yup.array().min(1, 'Please select at least one option'),
});


export default function Home() {

  const [dataset, setDataset] = useState([]);
  const [model, setModel] = useState([]);
  const [rules, setRules] = useState([]);
  const [ontology, setOntology] = useState([]);
  const [petri, setPetri] = useState({});
  const [input, setInput] = useState({});
  const [result, setResult] = useState({});

  // This Will run when the app renders and will setup a job to Periodically fetch the Users Badges
  useEffect(() => {
      console.log("FETCH USE EFFECT")

      setDataset(JSON.stringify(caseDataset, null, 4));
      setModel(JSON.stringify(caseModel, null, 4));
      setRules(JSON.stringify(ruleSet, null, 4));
      setOntology(JSON.stringify(ontologyTree, null, 4));
      setPetri(JSON.stringify(petriNet, null, 4));
      setInput(JSON.stringify(inputCase, null, 4));
  }, []);


  let initObject = {}

  const router = useRouter();

  
  const submitData = async () => {
    console.log("HANDLE SUBMIT")
    
    let allData = {   
        "dataset"    : dataset,
        "rules"      : rules,
        "model"      : model,
        "ontology"   : ontology,
        "petri"      : petri,
        "input"      : input,
    }


    console.log(allData)
    try {

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allData)
      };

      const response = await fetch('/api/submit', requestOptions);
      const data = await response.json();
      console.log(data)

      setResult(data)
 


    }
    catch (e){
      console.log(e)
    }

  }


  return (





    <Container my="md">

    <Grid>
      <Grid.Col xs={12}>
        <h1>Hybrid System</h1>
      </Grid.Col>
      <Grid.Col xs={12}>
          <Accordion variant="separated" defaultValue="input">

              <Accordion.Item value="model">
                  <Accordion.Control>Case Model</Accordion.Control>
                  <Accordion.Panel>
                    <JsonInput
                      label=""
                      placeholder="case-model.json"
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={4}
                      value={model}
                      onChange={setModel}
                    />

                  </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="dataset">
                  <Accordion.Control>Case Dataset</Accordion.Control>
                  <Accordion.Panel>
                    <JsonInput
                      label=""
                      placeholder="case-dataset.json"
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={4}
                      value={dataset}
                      onChange={setDataset}
                    />
                  </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="rules">
                  <Accordion.Control>Rule Set</Accordion.Control>
                  <Accordion.Panel>
                    <JsonInput
                      label=""
                      placeholder="rule-set.json"
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={4}
                      value={rules}
                      onChange={setRules}
                    />
                  </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="ontology">
                  <Accordion.Control>Ontology Tree</Accordion.Control>
                  <Accordion.Panel>
                    <JsonInput
                      label=""
                      placeholder="ontology-tree.json"
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={4}
                      value={ontology}
                      onChange={setOntology}
                    />
                  </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="petri">
                  <Accordion.Control>Petri Net</Accordion.Control>
                  <Accordion.Panel>
                    <JsonInput
                      label=""
                      placeholder="petri-net.json"
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={4}
                      value={petri}
                      onChange={setPetri}
                    />
                  </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="input">
                  <Accordion.Control>Input Case</Accordion.Control>
                  <Accordion.Panel>
                    <JsonInput
                      label=""
                      placeholder="input-case.json"
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={6}
                      value={input}
                      onChange={setInput}
                    />
                  </Accordion.Panel>
              </Accordion.Item>
          </Accordion>
      </Grid.Col>
      <Grid.Col xs={12}>
        <Button fullWidth onClick={ ()=>{  submitData()  } } > Run System</Button>
      </Grid.Col>


      <Grid.Col xs={12}>
          <Card>
              { result.rbrEnhancedCase && (
                <Fragment>
                  <h2> RBR Enhanced Case (STEP 1) </h2>  
                  <Table>
                    <thead>
                      <tr>
                        <th>Attr</th>
                        <th>Val</th>
                      </tr>
                    </thead>
                    <tbody>
                      { Object.entries(result.rbrEnhancedCase).map(([key , value]) => 
                                  <Fragment key={key}> 
                                      <tr> 
                                          <td> {key}</td> 
                                          <td> {JSON.stringify(value)}</td> 
                                      </tr>
                                  </Fragment>
                        )}
                  </tbody>
                  </Table>

                  <Text> RulesFired: {JSON.stringify(result.rulesFired)}  </Text>      


                </Fragment>  



                
               )}
          </Card>
      </Grid.Col>
      <Grid.Col xs={12}>
          <Card>
              { result.cbrEnhancedCase && (
                <Fragment>
                  <h2> CBR Enhanced Case  (STEP 2) </h2>  
                  <Table>
                    <thead>
                      <tr>
                        <th>Attr</th>
                        <th>Val</th>
                      </tr>
                    </thead>
                    <tbody>
                      { Object.entries(result.cbrEnhancedCase).map(([key , value]) => 
                                  <Fragment key={key}> 
                                      <tr> 
                                          <td> {key}</td> 
                                          <td> {JSON.stringify(value)}</td> 
                                      </tr>
                                  </Fragment>
                        )}
                  </tbody>
                  </Table>

                    <Text> BestCases </Text>    
                    <ul>
                          { (result.selectedCases).map( (cs) => (
                            <li key={cs.caseId}>
                                  Case {cs.caseId}
                            </li>
                          ))}
                    </ul>

                    <Text>Comparisson Details</Text>
                    <ul>
                    { (result.sortedSimilarCases).map( (cs) => (
                            <li key={cs.caseId}>
                                  Case {cs.caseId} - <b>{cs.similarity}</b> : {JSON.stringify(  cs.details )}
                            </li>
                    ))}     
                   </ul>

                </Fragment>  
                
               )}
          </Card>
      </Grid.Col>


      <Grid.Col xs={12}>
          <Card>
              { result.petrinetEnhancedCase && (
                <Fragment>
                  <h2> PetriNet Enhanced Case (STEP 3) </h2>  
                  <Table>
                    <thead>
                      <tr>
                        <th>Attr</th>
                        <th>Val</th>
                      </tr>
                    </thead>
                    <tbody>
                      { Object.entries(result.petrinetEnhancedCase).map(([key , value]) => 
                                  <Fragment key={key}> 
                                      <tr> 
                                          <td> {key}</td> 
                                          <td> {JSON.stringify(value)}</td> 
                                      </tr>
                                  </Fragment>
                        )}
                  </tbody>
                  </Table>

                  <Text> Petrinet Transitions: {JSON.stringify(result.transitionsHistory)}  </Text>      


                
                </Fragment>  
                
               )}
          </Card>
      </Grid.Col>

    </Grid>
  </Container>
  
  );
}