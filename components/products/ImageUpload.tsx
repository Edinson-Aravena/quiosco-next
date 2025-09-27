"use client"
import { CldUploadWidget } from 'next-cloudinary'
import { TbPhotoPlus } from 'react-icons/tb'

export default function ImageUpload() {
    return (



        <CldUploadWidget
            onSuccess={(result, {widget}) =>{
                console.log(result)
            }}
            uploadPreset="quiosco"
            options={{ maxFiles: 1 }}
            onUpload={(error, result) => {
                if (error) {
                    console.error("Error uploading image:", error);
                } else {
                    console.log("Image uploaded:", result);
                }
            }}
        >
            {({ open }) => (
                <>
                    <div>
                        <label className='text-slate-800'>Imagen Producto</label>
                        <div
                            className='relative cursor-pointer hover:opacity-70 transition p-10 border-neutral-300 flex flex-col justify-center items-center gap-4
                                     text-neutral-600 bg-slate-100'
                                     onClick={()=> open()}
                                     
                            >
                            <TbPhotoPlus
                                size={50}
                            />
                            <p className='text-lg font-semibold'>Agregar Imagen</p>
                        </div>

                    </div>
                </>
            )}
        </CldUploadWidget>



    )
}
