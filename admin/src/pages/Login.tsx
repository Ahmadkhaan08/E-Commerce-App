import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {motion} from "framer-motion"
const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <motion.div>
        <Card>
          <CardHeader>
            <motion.div>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Enter your details to register
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login