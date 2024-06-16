import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, addDoc } from "firebase/firestore"
import Swal from 'sweetalert2'

import { db } from '../config/firebase-config'

function NewProductPage() {
    const [ withOptions, setWithOptions ] = useState(false)
    const [ newitem, setNewItem ] = useState({
        item_id: "",
        category_id: "",
        item_name: "",
        description: "",
        price: "",
        stock: "",
    })
    const [ newoption, setNewOption ] = useState([{
        item_id: "",
        option_name: "",
        option_value: "",
        price: "",
        stock: ""    
    }])
    const [ categories, setCategories ] = useState([])

    const categoryCollectionRef = collection(db, 'category')

    //clear options field
    const clearOptions = () => {
        setNewOption([{
            item_id: "",
            option_name: "",
            option_value: "",
            price: "",
            stock: "" 
        }])
    }

    //clear items field
    const clearItems = () => {
        setNewItem({
            item_id: "",
            category_id: "",
            item_name: "",
            description: "",
            price: "",
            stock: "",
        })
    }

    //onChange event of our item input fields
    //added restrictions on data type
    const handleItemInputChange = (e) => {
        const { name, value } = e.target
        setNewItem((prevState) => ({
            ...prevState,
            [name]: name === "price" || name === "stock" ? Number(value) : value,
        }))
    }
    //onChange event of our options input fields
    const handleOptionInputChange = (index, e) => {
        const { name, value } = e.target
        const updatedOptions = [...newoption]
        updatedOptions[index] = {
            ...updatedOptions[index],
            [name]: name === "price" || name === "stock" ? Number(value) : value,
        }
        setNewOption(updatedOptions)
    }

    //add option input fields
    const handleAddOption = () => {
        setNewOption([...newoption, {
            item_id: "",
            option_name: "",
            option_value: "",
            price: "",
            stock: "" 
        }])
    }

    //remove option input fields
    const handleRemoveOption = (index) => {
        const updatedOptions = [...newoption]
        updatedOptions.splice(index, 1)
        setNewOption(updatedOptions)
    }

    //onSubmit event of our form to save new items
    const saveNewItem = async(e) => {
        e.preventDefault()
        try {
            const itemsCollection = collection( db, 'item' )
            const item = await getDocs(itemsCollection)
            const item_id = item.docs.length + 1
            await addDoc(itemsCollection, {
                item_id: item_id,
                category_id: newitem.category_id,
                item_name: newitem.item_name,
                description: newitem.description,
                price: newitem.price,
                stock: newitem.stock,
            })
            //checking if option input fields is empty
            if (newoption[0].option_name.length > 0) {
                const optionsPromises = newoption.map((option) =>
                    addDoc(collection(db, "options"), {
                        item_id: item_id,
                        option_name: option.option_name,
                        option_value: option.option_value,
                        price: option.price,
                        stock: option.stock,
                    })
                )
                await Promise.all(optionsPromises)
            }
            Swal.fire({
                title: "Success",
                text: "item added",
                icon: "success",
            })
            clearItems()
            clearOptions()
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
            })
        }
    }
    
    //toggle to show or hide input fields for options
    const addOptions = (e) => {
        e.preventDefault()
        setWithOptions(true)
    }
    const hideOptions = (e) => {
        e.preventDefault()
        setWithOptions(false)
        clearOptions()
    }

    //getting category from db for easier input
    const getData = async() => {
        const categorySnapshot = await getDocs(categoryCollectionRef)
        setCategories(categorySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} )))
    }

    useEffect(() => {
        getData()
    }, [])
    

    return (
        <div className="container mx-auto p-5">
            <div className="flex justify-start w-100">
                <Link to="/">
                    <button className="p-2"> <i className="fas fa-arrow-alt-left"></i> </button>
                </Link>
            </div>
            <form onSubmit={saveNewItem} className="flex flex-wrap justify-center">
                <div className="w-[50%] mobile-lg:!w-[100%] p-3">
                    <div className="form-group mb-2 w-[100%]">
                        <label htmlFor="item_name" className='m-0 font-semibold italic text-xl'> Item name: </label>
                        <input className='text-2xl p-1 border-2 border-black w-[100%]'
                            type="text" 
                            name="item_name"
                            placeholder="Item Name"
                            onChange={handleItemInputChange}
                            value={newitem.item_name}
                        />
                    </div>
                    <div className="form-group mb-2 w-[100%]">
                        <label htmlFor="price" className='m-0 font-semibold italic text-xl'> Item price: </label>
                        <input className='text-2xl p-1 border-2 border-black w-[100%]'
                            type="number" 
                            name="price"
                            placeholder="Item Price"
                            onChange={handleItemInputChange}
                            value={newitem.price}
                        />
                    </div>
                    <div className="form-group mb-2 w-[100%]">
                        <label htmlFor="stock" className='m-0 font-semibold italic text-xl'> Item stock: </label>
                        <input className='text-2xl p-1 border-2 border-black w-[100%]'
                            type="number" 
                            name="stock"
                            placeholder="Item Stock"
                            onChange={handleItemInputChange}
                            value={newitem.stock}
                        />
                    </div>
                    <div className="form-group mb-2 w-[100%]">
                        <label htmlFor="description" className='m-0 font-semibold italic text-xl'> Item description: </label>
                        <textarea className='border-2 border-black w-[100%] text-2xl p-1' rows={5}
                            name="description"
                            placeholder="Item Description"
                            onChange={handleItemInputChange}
                            value={newitem.description}
                        />
                    </div>
                    <div className="form-group mb-2 w-[100%]">
                        <label htmlFor="category" className='m-0 font-semibold italic text-xl'> Item category: </label>
                        <select className='border-2 border-black w-[100%] text-2xl p-1'
                            name="category_id"
                            onChange={handleItemInputChange}
                            value={newitem.category_id}
                        >
                            <option className='text-center' value=""> --SELECT VALUE-- </option>
                            {categories.map((val,ndx) => 
                                <option className='p-1' key={ndx} value={val.category_id}> {val.category_name} </option>
                            )}
                        </select>
                    </div>
                </div>
                <div className="w-[50%] mobile-lg:!w-[100%] p-3">
                    {withOptions == false ? 
                            <button onClick={addOptions} className="float-right font-semibold italic text-base hover:cursor-pointer outline-none"> Add Options <i className="fas fa-toggle-off fa-lg"></i> </button> 
                        :
                        <div className="contents">
                            <button onClick={hideOptions} className="float-right font-semibold italic text-base hover:cursor-pointer outline-none"> Close Options <i className="fas fa-toggle-on fa-lg text-green-500"></i> </button>
                            {newoption.map((option, index) => 
                                <div className="flex flex-wrap w-[100%] mobile-lg:!mb-5 mobile-lg:!border-b-2 border-black" key={index}>
                                    <div className="form-group mb-2 w-[25%] mobile-lg:!w-[100%] p-1">
                                        <label htmlFor="option_name" className='m-0 font-semibold italic text-lg'> Option name: </label>
                                        <input className='text-xl p-1 border-2 border-black w-[100%]'
                                            type="text" 
                                            name="option_name"
                                            placeholder="Option Name"
                                            onChange={(e) => handleOptionInputChange(index,e)}
                                            value={option.item_name}
                                        />
                                    </div>
                                    <div className="form-group mb-2 w-[25%] mobile-lg:!w-[100%] p-1">
                                        <label htmlFor="option_value" className='m-0 font-semibold italic text-lg'> Option value: </label>
                                        <input className='text-xl p-1 border-2 border-black w-[100%]'
                                            type="text" 
                                            name="option_value"
                                            placeholder="Option Value"
                                            onChange={(e) => handleOptionInputChange(index,e)}
                                            value={option.option_value}
                                        />
                                    </div>
                                    <div className="form-group mb-2 w-[20%] mobile-lg:!w-[100%] p-1">
                                        <label htmlFor="stock" className='m-0 font-semibold italic text-lg'> Item stock: </label>
                                        <input className='text-xl p-1 border-2 border-black w-[100%]'
                                            type="number" 
                                            name="stock"
                                            placeholder="Option Stock"
                                            onChange={(e) => handleOptionInputChange(index,e)}
                                            value={option.stock}
                                        />
                                    </div>
                                    <div className="form-group mb-2 w-[20%] mobile-lg:!w-[100%] p-1">
                                        <label htmlFor="price" className='m-0 font-semibold italic text-lg'> Item price: </label>
                                        <input className='text-xl p-1 border-2 border-black w-[100%]'
                                            type="number" 
                                            name="price"
                                            placeholder="Option Price"
                                            onChange={(e) => handleOptionInputChange(index,e)}
                                            value={option.price}
                                        />
                                    </div>
                                    {index ? 
                                        <button
                                            type="button"
                                            className="form-group w-[5%] py-2 m-1 bg-red-500 border-2 border-red-900"
                                            onClick={() => handleRemoveOption(index)}
                                        >
                                            <i className="fas fa-trash-alt text-white text-xl"></i>
                                        </button> : null
                                    }
                                </div>
                            )}
                            <button className='border p-2 bg-green-500 border-2 border-green-900' type="button" onClick={handleAddOption}><i className="far fa-plus-circle text-white"></i></button>
                        </div>
                    }
                </div>
                <button className='w-[50%] border p-1 text-center bg-green-500 text-white font-bold text-2xl border-2 border-green-900' type="submit"> SAVE ITEM </button>
            </form>
        </div>
    )
}

export default NewProductPage