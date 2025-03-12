// Sample 1: Autocompletion & Type Safety
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

const sample: User = {
  id: 0,
  name: "",
  email: "",
  password: ""
};
console.log(sample.password);
// Sample 2: Function with Missing Arguments

const sampleFuntion = (param1: string, param2?: string) => {
  return param1 + param2;
};
console.log(sampleFuntion("SAMPLE")); //  "SAMPLEundefined"
