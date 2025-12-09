"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpUser } from "@/lib/actions/user.action";
import { useSearchParams } from "next/navigation";
const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: "",
  });
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button variant="default" className="w-full" disabled={pending}>
        {pending ? "Submitting..." : "Sign up"}
      </Button>
    );
  };

  return (
    <form className="space-y-6" action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          defaultValue={signUpDefaultValues.name}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={signUpDefaultValues.email}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="password"
          defaultValue={signUpDefaultValues.password}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="confirmPassword"
          defaultValue={signUpDefaultValues.confirmPassword}
        />
      </div>
      <SignUpButton />
      {data && !data.success && (
        <p className="text-center text-destructive">{data.message}</p>
      )}
      <div className="text-sm text-center text-muted-foreground">
        Don&pos; have an account?{" "}
        <Link href="/sign-in" className="link" target="_self">
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;
