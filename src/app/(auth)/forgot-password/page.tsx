import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';


export default function ForgetPasswordPage() {
  return(
    <Card className="w-full rounded-2xl border border-neutral-100 shadow-lg ">

      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-neutral-900">
          Forget your password ?
        </CardTitle>

        <CardDescription className="text-sm text-neutral-900">
          Password reset will be available soon.
          Please contact support for now.
        </CardDescription>
      </CardHeader>

      <CardContent className="text-canter">

        <p className="text-sm text-neutral-600">
          Email us at

          <a
            href="mailto:support@funtush.com"
            className="text-primary-900 hover-underline"
          >
            support@funtush.com
          </a>

        </p>

        <Link href={ROUTES.AUTH.LOGIN}
        className="mt-6 inline-block text-sm text-primary-600 hover:underline text-black">
          Back to Sign in 
        </Link>
      </CardContent>

    </Card>
  )
}