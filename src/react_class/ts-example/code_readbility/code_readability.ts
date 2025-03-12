// Sample 1: With Types - Improved Readability
const calculateTotalTs = (price: number, quantity: number): number => {
  return price * quantity;
};

console.log(calculateTotalTs(10, 5)); // Output: 500

// Sample 2: Object with Expected Types
interface UserDetails {
  name: string;
  age: number;
}

// Sample 2: Object with Expected Types
const createUser = (user: UserDetails): void => {
  console.log(`${user.name + " is " + user.age + " years old."}`);
};

createUser({
  name: "",
  age: 0
});
