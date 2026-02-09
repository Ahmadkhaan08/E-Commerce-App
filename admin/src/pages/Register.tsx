import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Meteors } from "@/components/ui/meteors"
import {motion} from "framer-motion"

const Register = () => {
  return (
    <>
    <Meteors/>
     <div className="flex items-center justify-center min-h-screen w-full bg-black">
      <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.5, ease:"easeOut"}}
      className="w-full max-w-md px-4">
        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200">
          <CardHeader className="text-center space-y-2">
            <motion.div
            initial={{scale:0.8 }}
            animate={{scale:1}}
            transition={{duration:0.3}}>
              <CardTitle className="text-3xl font-bold text-gray-800">Create an Account</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your details to register
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            {/* <Form {...form}></Form> */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  )
}

export default Register