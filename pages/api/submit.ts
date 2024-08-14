// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import hybrid from '../../hybrid';


// type Data = {
//   name: string
// }

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  let allData = req.body;

  let result = hybrid.runHybridSystem(JSON.parse(allData.model),JSON.parse(allData.rules),JSON.parse(allData.ontology),JSON.parse(allData.dataset),JSON.parse(allData.petri),JSON.parse(allData.input))


  console.log(result)

  res.status(200).json( result )
}
