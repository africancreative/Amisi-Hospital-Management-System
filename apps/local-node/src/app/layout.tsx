export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#07070a] text-white">
        {children}
      </body>
    </html>
  )
}
