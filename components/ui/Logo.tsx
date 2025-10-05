import Image from "next/image";


export default function Logo() {
  return (
    <div className="flex justify-center items-center py-1">
        <div className="relative w-32 h-16 sm:w-40 sm:h-20 lg:w-56 lg:h-20">
            <Image
                fill
                alt="Imagen logotipo"
                src="/logo.png"
                className="object-contain drop-shadow-lg"
                priority
            />
        </div>
    </div>
  )
}
