import { useState } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaFilePdf } from 'react-icons/fa';
import { ClipLoader } from "react-spinners"
const ProductAddPage = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        date: '',
        items: []
    });
    const [loading, setLoading] = useState(false)

    const addNewItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, price: '', subItems: [] }]
        });
    };

    const updateItem = (index, key, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index][key] = value;
        setFormData({ ...formData, items: updatedItems });
    };

    const deleteItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    const addSubItem = (itemIndex) => {
        const updatedItems = [...formData.items];
        updatedItems[itemIndex].subItems.push({ name: '', quantity: 1, price: '' });
        setFormData({ ...formData, items: updatedItems });
    };

    const updateSubItem = (itemIndex, subIndex, key, value) => {
        const updatedItems = [...formData.items];
        updatedItems[itemIndex].subItems[subIndex][key] = value;
        setFormData({ ...formData, items: updatedItems });
    };

    const deleteSubItem = (itemIndex, subIndex) => {
        const updatedItems = [...formData.items];
        updatedItems[itemIndex].subItems = updatedItems[itemIndex].subItems.filter((_, i) => i !== subIndex);
        setFormData({ ...formData, items: updatedItems });
    };

    const generatePDF = async () => {
        console.log(formData);
        setLoading(true);

        try {
            const response = await axios.post('http://ec2-13-203-184-112.ap-south-1.compute.amazonaws.com:3005/generate-pdf', formData);


            if (response.data && response.data.pdfUrl) {
                const pdfUrl = response.data.pdfUrl;

                // Fetch the PDF file as a Blob
                const pdfResponse = await axios.get(pdfUrl, {
                    responseType: 'blob', // Important for handling binary data
                });

                // Create a Blob URL for the PDF file
                const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);

                // Create an anchor element and trigger an automatic download
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', 'invoice.pdf'); // Change filename if needed
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Revoke the Blob URL to free memory
                URL.revokeObjectURL(blobUrl);
            } else {
                alert('PDF URL not found in response.');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF.');
        } finally {
            setLoading(false);
            setFormData({
                companyName: '',
                date: '',
                items: []
            })

        }
    };



    return (
        <div className="p-6 bg-[#2e2e48] rounded-md text-white">
            <h1 className="text-2xl font-semibold mb-6 text-white">Add New Product</h1>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md w-full bg-[#383854]"
                />
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md w-full bg-[#383854]"
                />

                {formData.items.map((item, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-2 bg-transparent relative">
                        <button onClick={() => deleteItem(index)} className="absolute top-2 right-2 text-red-500">
                            <FaTrash />
                        </button>
                        <input type="text" placeholder="Main Item Name" className="p-2 border border-gray-300 rounded-md w-full bg-[#383854]"
                            value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)}
                        />
                        <div className="flex gap-2">
                            <input type="number" placeholder="Quantity" className="p-2 border border-gray-300 rounded-md w-1/2 bg-[#383854]"
                                value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            />
                            <input type="number" placeholder="Price per Unit" className="p-2 border border-gray-300 rounded-md w-1/2 bg-[#383854]"
                                value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)}
                            />
                        </div>

                        {item.subItems.map((subItem, subIndex) => (
                            <div key={subIndex} className="border-l-4 pl-4 space-y-2 relative">
                                <button onClick={() => deleteSubItem(index, subIndex)} className="absolute top-2 right-2 text-red-500">
                                    <FaTrash />
                                </button>
                                <input type="text" placeholder="Sub Item Name" className="p-2 border border-gray-300 rounded-md w-full bg-[#383854]"
                                    value={subItem.name} onChange={(e) => updateSubItem(index, subIndex, 'name', e.target.value)} required
                                />
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Quantity" className="p-2 border border-gray-300 rounded-md w-1/2 bg-[#383854]"
                                        value={subItem.quantity} onChange={(e) => updateSubItem(index, subIndex, 'quantity', e.target.value)}
                                    />
                                    <input type="number" placeholder="Price per Unit" className="p-2 border border-gray-300 rounded-md w-1/2 bg-[#383854]"
                                        value={subItem.price} onChange={(e) => updateSubItem(index, subIndex, 'price', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        <button onClick={() => addSubItem(index)} className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md flex items-center gap-2">
                            <FaPlus /> Add Sub Item
                        </button>
                    </div>
                ))}

                <button onClick={addNewItem} className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center gap-2">
                    <FaPlus /> Add Main Item
                </button>

                <button onClick={generatePDF} className="px-4 py-2 bg-green-600 text-white rounded-md mt-4 w-full flex items-center justify-center gap-2">
                    {!loading ? (<><FaFilePdf color='white' /> Generate PDF</>) : <ClipLoader />}
                </button>
            </div>
        </div>
    );
};

export default ProductAddPage;
