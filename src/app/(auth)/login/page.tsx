'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { saveSessionEverywhere, ROLE_REDIRECT } from '@/lib/auth';
import { ROUTES } from '@/lib/constants/routes';
import type { RawUser, SessionUser } from '@/types/user';
import usersData from '../../../../data/users.json';


const users = usersData as unknown as RawUser[];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const [isLoading, setIsLoading] = useState(false);


  function validateEmail(value: string): string {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  }

  function validatePassword(value: string): string {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return '';
  }

  function handleEmailBlur() {
    setEmailError(validateEmail(email));
  }

  function handlePasswordBlur() {
    setPasswordError(validatePassword(password));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError('');

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        setFormError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      const session: SessionUser = {
        id: foundUser.id,
        role: foundUser.role,
        agency_id: foundUser.agency_id,
        name: foundUser.name,
        email: foundUser.email,
        password: foundUser.password,
        country: foundUser.country,
        phone: foundUser.phone,
        member_since: foundUser.member_since,
        token: `mock-jwt-${foundUser.id}-${Date.now()}`,
      };

      saveSessionEverywhere(session);

      document.cookie = `authToken=${session.token}; path=/; max-age=86400`;

      const redirectPath = ROLE_REDIRECT[foundUser.role];
      router.push(redirectPath);

    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full rounded-2xl border border-neutral-200 shadow-lg">

      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-neutral-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-neutral-500">
          Sign in to your Funtush account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {formError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              onBlur={handleEmailBlur}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-neutral-900 outline-none transition
                placeholder:text-neutral-400
                focus:ring-2
                ${
                  emailError
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
                }`}
            />
            {emailError && (
              <p className="text-xs text-red-500">{emailError}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                onBlur={handlePasswordBlur}
                placeholder="Min. 8 characters"
                autoComplete="current-password"
                className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-neutral-900 outline-none transition
                  placeholder:text-neutral-400
                  focus:ring-2
                  ${
                    passwordError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-sm text-neutral-900 hover:underline "
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full rounded-xl  text-neutral-900"
          >
            Sign in
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}