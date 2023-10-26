function createItem(data) {
    const product = data.donation? {
        name: data.name, 
        description: `Tipo de animal: ${data.type}`,
        image: 'https://animalgenetics.com/wp-content/uploads/2023/01/ANIMAL-ICONS-CANINE.png'
    } : {
        name: "Donación",
        image: 'https://cdn-icons-png.flaticon.com/512/5316/5316685.png'
    }

    const item = [
        {
            price_data: {
                currency: 'cop',
                product_data: product,
                unit_amount: data.unit_amount,
            },
            quantity: data.quantity,
        }
    ]
    return item
}


export {createItem}