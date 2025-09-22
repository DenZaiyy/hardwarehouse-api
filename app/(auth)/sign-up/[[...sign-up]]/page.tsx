import {SignUp} from "@clerk/nextjs"

const SignUpPage = () => {
    return (
        <div className={"flex flex-col gap-4 items-center justify-center"}>
            <h1 className="text-4xl text-foreground font-bold">
                S&apos;inscrire
            </h1>
            <SignUp path="/sign-up" />
        </div>
    )
}

export default SignUpPage