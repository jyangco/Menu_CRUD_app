import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { updateDoc, getDoc, doc } from "firebase/firestore"
import Swal from "sweetalert2"

import { db } from "../config/firebase-config"

function EditProductPage() {
    const location = useLocation()
    const [ itemData, setItemData ] = useState({
        item_id: "",
        item_name: "",
        category_id: "",
        description: "",
        price: "",
        stock: "",
    })

    useEffect(() => {
        const itemIdFromLocation = location.state?.id || ""
        if (itemIdFromLocation) {
            setItemData((prevState) => ({ ...prevState, item_id: itemIdFromLocation }))
            fetchItemData(itemIdFromLocation)
        }
    }, [location.state])

    const fetchItemData = async (id) => {
        try {
            const itemDocRef = doc(db, "item", id)
            const itemSnapshot = await getDoc(itemDocRef)
            if (itemSnapshot.exists()) {
                const itemData = itemSnapshot.data()
                setItemData((prevState) => ({
                ...prevState,
                item_name: itemData.item_name,
                description: itemData.description,
                category_id: itemData.category_id,
                stock: itemData.stock,
                price: itemData.price,
                }))
            }
        } catch (error) {
            console.error("Error fetching item data: ", error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setItemData((prevState) => ({
            ...prevState,
            [name]: name === 'stock' || name === 'price' ? Number(value) : value
        }))
    }

    const handleUpdateItem = async (e) => {
        e.preventDefault()
        try {
            const itemDocRef = doc(db, "item", itemData.item_id)
            await updateDoc(itemDocRef, {
            name: itemData.item_name,
            description: itemData.description,
            stock: itemData.stock,
            price: itemData.price,
            })
            Swal.fire({
                title: "Success",
                text: "item added",
                icon: "success",
            })
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
            })
        }
    }

    return(
        <div className="container mx-auto">
            <div className="flex justify-start w-100">
                <Link to="/">
                    <button className="p-2 border"> Back </button>
                </Link>
            </div>
            <form onSubmit={handleUpdateItem} className="flex flex-col justify-evenly">
                <div className="form-group mb-2 text-xl">
                    <label htmlFor="item_name" className='m-0'> Item name: </label>
                    <input className='text-2xl p-1 border-2 border-dark'
                        type="text" 
                        name="item_name"
                        onChange={handleInputChange}
                        value={itemData.item_name}
                    />
                </div>
                <div className="form-group mb-2 text-xl">
                    <label htmlFor="price" className='m-0'> Item price: </label>
                    <input className='text-2xl p-1 border-2 border-dark'
                        type="text" 
                        name="price"
                        onChange={handleInputChange}
                        value={itemData.price}
                    />
                </div>
                <div className="form-group mb-2 text-xl">
                    <label htmlFor="stock" className='m-0'> Item stock: </label>
                    <input className='text-2xl p-1 border-2 border-dark'
                        type="number" 
                        name="stock"
                        onChange={handleInputChange}
                        value={itemData.stock}
                    />
                </div>
                <div className="form-group mb-2 text-xl">
                    <label htmlFor="description" className='m-0'> Item description: </label>
                    <textarea className='border w-[100%] p-2'
                        name="description"
                        onChange={handleInputChange}
                        value={itemData.description}
                    />
                </div>
                <button className='border p-2 my-3' type="submit"> Save </button>
            </form>
        </div>
    )
}

export default EditProductPage