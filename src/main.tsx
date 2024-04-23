import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { Router } from '@/router'
import { ModalProvider } from '@/components/Modal'
import { Provider } from 'urql'
import { client } from '@/lib/urql'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider value={client}>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Toaster />
				<ModalProvider />
				<Suspense fallback={null}>
					<Router />
				</Suspense>
			</ThemeProvider>
		</Provider>
	</React.StrictMode>
)
