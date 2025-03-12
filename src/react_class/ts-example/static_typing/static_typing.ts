// Sample 1: Constant Variable  Overriding
let nameVariable: string = "This is sample name ";
nameVariable = "45565";

// Sample 2: Function Argument Unknown Type
const sampleFunctionTs = (param1:string, param2:string) => {
  return param1 + param2;
};
console.log(sampleFunctionTs("sample", "bjasd")); // Output: "3232bjasd"
