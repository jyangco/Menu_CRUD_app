import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { updateDoc, getDoc, doc, getDocs, query, where, collection, writeBatch } from "firebase/firestore"
import Swal from "sweetalert2"

import { db } from "../config/firebase-config"

function EditProductPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [ itemData, setItemData ] = useState({
        item_id: "",
        item_name: "",
        category_id: "",
        description: "",
        price: "",
        stock: "",
    })
    const [options, setOptions] = useState([])

    useEffect(() => {
        //getting item id from the previous page and calling a function to get their data
        const itemIdFromLocation = location.state?.id || ""
        if (itemIdFromLocation) {
            setItemData((prevState) => ({ ...prevState, id: itemIdFromLocation }))
            fetchItemData(itemIdFromLocation)
        }
    }, [location.state])

    //getting data from database using the item id
    const fetchItemData = async (id) => {
        try {
            const itemDocRef = doc(db, "item", id)
            const itemSnapshot = await getDoc(itemDocRef)
            if (itemSnapshot.exists()) {
                const itemData = itemSnapshot.data()
                setItemData((prevState) => ({
                ...prevState,
                    item_id: itemData.item_id || "",
                    item_name: itemData.item_name || "",
                    description: itemData.description || "",
                    category_id: itemData.category_id || "",
                    stock: itemData.stock || "",
                    price: itemData.price || "",
                }))
                const optionsQuery = query(collection(db, "options"), where("item_id", "==", itemData.item_id))
                const optionsSnapshot = await getDocs(optionsQuery)
                const optionsData = optionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setOptions(optionsData)
            }
        } catch (error) {
            console.error("Error fetching item data: ", error)
        }
    }

    //onChange event of item fields
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setItemData((prevState) => ({
            ...prevState,
            [name]: name === 'stock' || name === 'price' ? Number(value) : value
        }))
    }

    //onChange event of option fields
    const handleOptionChange = (index, e) => {
        const { name, value } = e.target
        const updatedOptions = options.map((option, i) => i === index ? { ...option, [name]: value } : option)
        setOptions(updatedOptions)
    }

    //add and remove option fields if needed
    const handleAddOption = () => {
        setOptions([...options, { option_name: "", option_value: "", price: "", stock: "" }])
    }
    const handleRemoveOption = (index) => {
        setOptions(options.filter((_, i) => i !== index))
    }

    //onSubmit event of our form to save the updated data of the item
    const handleUpdateItem = async (e) => {
        e.preventDefault()
        try {
            const itemDocRef = doc(db, "item", itemData.id)
            await updateDoc(itemDocRef, {
                item_name: itemData.item_name,
                description: itemData.description,
                stock: itemData.stock,
                price: itemData.price,
            })
            const batch = writeBatch(db)
            options.forEach(option => {
                const optionDocRef = doc(db, "options", option.id || doc(collection(db, "options")).id)
                batch.set(optionDocRef, { ...option, item_id: itemData.item_id }, { merge: true })
            })
            await batch.commit()
            Swal.fire({
                title: "Success",
                text: "item updated",
                icon: "success",
            }).then(() => {
                navigate("/")
            })
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
            })
        }
    }

    //Delete function for deleting item and their corresponding options
    const handleDeleteItem = async () => {
        try {
            const optionsQuery = query(collection(db, "options"), where("item_id", "==", itemData.item_id))
            const optionsSnapshot = await getDocs(optionsQuery)
            const batch = writeBatch(db)
            optionsSnapshot.forEach(doc => {
                batch.delete(doc.ref)
            })
            const itemDocRef = doc(db, "item", itemData.id)
            batch.delete(itemDocRef)
            await batch.commit()
            Swal.fire({
                title: "Success",
                text: "Item and its options deleted",
                icon: "success",
            }).then(() => {
                navigate("/")
            })
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
            })
        }
    }

    //prompt if delete button is clicked, no surprise deletion
    const prompt = (e) => {
        e.preventDefault()
        Swal.fire({
            allowOutsideClick: false,
            title: "You are about to delete the item",
            text: "Do you wish to proceed?",
            icon: "warning",
            showCancelButton: false,
            showDenyButton: true,
            denyButtonText: 'Cancel',
            confirmButtonText: 'Yes',
        })
        .then((result) => {
            if (result.isConfirmed) {
                handleDeleteItem()
            }
        })
    }

    return(
        <div className="container mx-auto p-5">
            <div className="flex justify-start w-100">
                <Link to="/">
                    <button className="p-2"> <i className="fas fa-arrow-alt-left"></i> </button>
                </Link>
            </div>
            <form onSubmit={handleUpdateItem} className="flex flex-wrap justify-evenly">
                <div className="w-[50%] mobile-lg:!w-[100%] p-3">
                    <div className="form-group mb-2 text-xl">
                        <label htmlFor="item_name" className='m-0 font-semibold italic text-lg'> Item name: </label>
                        <input className='text-2xl p-1 border-2 border-black w-[100%]'
                            type="text" 
                            name="item_name"
                            onChange={handleInputChange}
                            value={itemData.item_name}
                        />
                    </div>
                    <div className="form-group mb-2 text-xl">
                        <label htmlFor="price" className='m-0 font-semibold italic text-lg'> Item price: </label>
                        <input className='text-2xl p-1 border-2 border-black w-[100%]'
                            type="text" 
                            name="price"
                            onChange={handleInputChange}
                            value={itemData.price}
                        />
                    </div>
                    <div className="form-group mb-2 text-xl">
                        <label htmlFor="stock" className='m-0 font-semibold italic text-lg'> Item stock: </label>
                        <input className='text-2xl p-1 border-2 border-black w-[100%]'
                            type="number" 
                            name="stock"
                            onChange={handleInputChange}
                            value={itemData.stock}
                        />
                    </div>
                    <div className="form-group mb-2 text-xl">
                        <label htmlFor="description" className='m-0 font-semibold italic text-lg'> Item description: </label>
                        <textarea className='border-2 border-black w-[100%] p-2' rows={5}
                            name="description"
                            onChange={handleInputChange}
                            value={itemData.description}
                        />
                    </div>
                </div>
                <div className="w-[50%] mobile-lg:!w-[100%] p-3">
                    <div className="form-group mb-2 text-xl">
                        <label className="font-semibold italic text-lg">Options:</label>
                        {options.map((option, index) => 
                            <div key={index} className="flex flex-wrap w-[100%] mobile-lg:!mb-5 mobile-lg:!border-b-2 border-black">
                                <div className="form-group mb-2 w-[25%] mobile-lg:!w-[100%] p-1">
                                    <label htmlFor="option_name" className='m-0 font-semibold italic text-lg'> Option name: </label>
                                    <input className='text-xl border-2 border-black p-1 w-[100%]'
                                        type="text"
                                        name="option_name"
                                        placeholder="Option Name"
                                        onChange={(e) => handleOptionChange(index, e)}
                                        value={option.option_name}
                                    />
                                </div>
                                <div className="form-group mb-2 w-[25%] mobile-lg:!w-[100%] p-1">
                                    <label htmlFor="option_name" className='m-0 font-semibold italic text-lg'> Option value: </label>
                                        <input className='text-xl border-2 border-black p-1 w-[100%]'
                                        type="text"
                                        name="option_value"
                                        placeholder="Option Value"
                                        onChange={(e) => handleOptionChange(index, e)}
                                        value={option.option_value}
                                    />
                                </div>
                                <div className="form-group mb-2 w-[20%] mobile-lg:!w-[100%] p-1">
                                    <label htmlFor="option_name" className='m-0 font-semibold italic text-lg'> Item Stock: </label>
                                    <input className='text-xl border-2 border-black p-1 w-[100%]'
                                        type="number"
                                        name="stock"
                                        placeholder="Option Stock"
                                        onChange={(e) => handleOptionChange(index, e)}
                                        value={option.stock}
                                    />
                                </div>
                                <div className="form-group mb-2 w-[20%] mobile-lg:!w-[100%] p-1">
                                    <label htmlFor="option_name" className='m-0 font-semibold italic text-lg'> Item Price: </label>
                                    <input className='text-xl border-2 border-black p-1 w-[100%]'
                                        type="text"
                                        name="price"
                                        placeholder="Option Price"
                                        onChange={(e) => handleOptionChange(index, e)}
                                        value={option.price}
                                    />
                                </div>
                                <button className="form-group w-[5%] mobile-lg:!w-[100%] py-2 m-1 bg-red-500 border-2 border-red-900" type="button" onClick={() => handleRemoveOption(index)}>
                                    <i className="fas fa-trash-alt text-white text-xl"></i>
                                </button>
                            </div>
                        )}
                        <button className='border p-2 bg-green-500 border-2 border-green-900' type="button" onClick={handleAddOption}><i className="far fa-plus-circle text-white"></i></button>
                    </div>
                </div>
                <button className='w-[40%] border p-1 text-center bg-green-500 text-white font-bold text-2xl border-2 border-green-900' type="submit"> SAVE ITEM </button>
                <button className="w-[40%] border p-1 text-center bg-red-500 text-white font-bold text-2xl border-2 border-red-900" onClick={prompt}> DELETE ITEM </button>
            </form>
        </div>
    )
}

export default EditProductPage