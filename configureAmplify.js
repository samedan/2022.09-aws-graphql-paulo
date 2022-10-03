import { Amplify } from "aws-amplify";
import awsmobile from "./src/aws-exports";

console.log(awsmobile);

Amplify.configure(awsmobile);
