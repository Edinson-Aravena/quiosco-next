export default function Heading({children} : {children: React.ReactNode}) {
  return (
    <>
        <div className="mb-4">
            <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
                {children}
            </h1>
            <div className="mt-3 h-1.5 w-24 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full shadow-md"></div>
        </div>
    </>
  )
}
