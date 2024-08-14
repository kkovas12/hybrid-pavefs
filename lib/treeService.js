
let treeSimilarity = (a , b , node, tree) => {

    let branch = getTreeBranch (node, tree)

    let flAB = fl( a,b,branch )
    let lA   = lvl(a,branch)
    let lB   = lvl(b,branch)

    let lca = findLowestCommonAncestor(a,b,branch)
    let lLCA   = lvl(lca,branch)

    let pAB =  findPathLength(lA,lB,lLCA)

    let maxpA = maxP (a , branch)
    let maxpB = maxP (b , branch)

    let f1 = 1 / flAB
    let f2a =  (lA - flAB ) / maxpA
    let f2b =  (lB - flAB)  / maxpB
    let f2  = (f2a + f2b) / 2
    let f3  =   pAB /  (maxpA + maxpB)

    let distance = f1 * f2 * f3
    let  similarity = 1 - distance

    //console.log("similarity "+a+" , "+b + " = "+similarity)

    return similarity

}

const getTreeBranch = (label , tree) => {
  // Check if the current node matches the desired label
  if (tree.item === label) {
    return tree; // Return the current node as the branch
  }
  // Traverse the children nodes
  for (const child of tree.children) {
    const branch = getTreeBranch(label, child);
    if (branch) {
      return branch; // Return the branch if found in the child subtree
    }
  }
  // Return null if the label is not found in the tree
  return null;
}

// level of the nearest common father node of A,B
const fl = (a,b,tree) => {

    return 1
} 

// level of A
const lvl = (label , tree, level = 0) => {
  // Check if the current node matches the desired label
  if (tree.item === label) {
    return level; // Return the level of the current node
  }
  // Traverse the children nodes
  for (const child of tree.children) {
    const nodeLevel = lvl(label, child, level + 1);
    if (nodeLevel !== -1) {
      return nodeLevel; // Return the level if found in the child subtree
    }
  }
  // Return -1 if the label is not found in the tree
  return -1;
}

// the length of the maximum path starting from the root to a leaf and containing node A
const maxP = (a, tree) => {

    let lA   = lvl(a,tree) // this is the number of nodes from Root Till A

    let branch = getTreeBranch(a, tree);

    let deepestLeaf = findDeepestNode (branch) // this will find the deepest Leaf of the A subtree

    //console.log("DEEPEST "+deepestLeaf.item)
    let lD   = lvl(deepestLeaf.item,branch)
    //console.log( lA + "-+-"+lD+"-=-"+( lA+lD))
  

    // find the level of A in the tree
    // find the branch from A
    // find the maximum path

    return lA+lD

}

// length of the directed path (number of edges) connecting A and B 
const findPathLength = (lvlA, lvlB, lvlLowestCommonAncestor) => {
  return ( lvlA - lvlLowestCommonAncestor ) + (lvlB - lvlLowestCommonAncestor)
}


//  find the lowest common ancestor
const findLowestCommonAncestor = (labelA, labelB, tree) => {
  // Check if the current node matches labelA or labelB
  if (tree.item === labelA || tree.item === labelB) {
    return tree.item; // Return the current node as the LCA candidate
  }

  let foundLeft = false;
  let foundRight = false;

  // Traverse the children nodes
  for (const child of tree.children) {
    const result = findLowestCommonAncestor(labelA, labelB, child);
    if (result !== null) {
      if (foundLeft && foundRight) {
        return tree.item; // Return the current node as the LCA when both labels are found in different subtrees
      } else if (result === labelA) {
        foundLeft = true;
      } else if (result === labelB) {
        foundRight = true;
      }
    }
  }

  if (foundLeft && foundRight) {
    return tree.item; // Return the current node as the LCA when both labels are found in the same subtree
  } else if (foundLeft) {
    return labelA; // Return labelA as the LCA candidate
  } else if (foundRight) {
    return labelB; // Return labelB as the LCA candidate
  } else {
    return null; // Return null when neither labelA nor labelB are found in the tree
  }
};

// Find Deepest Node
const findDeepestNode = (tree) => {
  let deepestNode = null;
  let maxDepth = -1;

  const dfs = (node, depth) => {
    //console.log(node.item)
    if (depth > maxDepth) {
      deepestNode = node;
      maxDepth = depth;
    }

    for (const child of node.children) {
      dfs(child, depth + 1);
    }
  };

  dfs(tree, 0);

  return deepestNode;
};


module.exports = {treeSimilarity}