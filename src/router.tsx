import { useAuthStore } from '@/lib/auth'
import { ConfirmAccount } from '@/pages/ConfirmAccount'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { ResetPassword } from '@/pages/ResetPassword'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'

export const Router = () => {
	const { isLoggedIn, profile } = useAuthStore()

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/confirm-account" element={<ConfirmAccount />} />

				{!isLoggedIn && !profile ? (
					<Route path="/" element={<Outlet />}>
						<Route path="/" element={<Login />} />
					</Route>
				) : (
					<Route path="/" element={<Outlet />}>
						<Route path="/" element={<Home />} />
					</Route>
				)}
			</Routes>
		</BrowserRouter>
	)
}
