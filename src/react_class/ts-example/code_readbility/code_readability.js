// Sample 1: Without Types - Less Readable
const calculateTotalJs = (price, quantity) => {
  return price * quantity;
};

console.log(calculateTotal(100, 5)); // Output: 500
console.log(calculateTotal("100", "5")); // Output: "1005" (not the intended behavior)

// Sample 2: Object with Expected Types
const createUser = (user) => {
  console.log(user.name + " is " + user.age + " years old.");
};

createUser({ name: "John", age: 30 });
createUser({ name: "Jane" }); // This will throw an error when run
