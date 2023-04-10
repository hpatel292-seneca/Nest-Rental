let rental_obj = [
    {
        headline: 'Doncaster',
        numBedrooms: 7,
        numBathrooms: 4,
        pricePerNight: 350,
        city: 'Markham',
        province: "Ontario",
        imageUrl: '../../a1.jpg',
        featuredRental: true,
    },
    {
        headline: 'Toogood Pond Park',
        numBedrooms: 4,
        numBathrooms: 2,
        pricePerNight: 240,
        city: 'Markham',
        province: "Ontario",
        imageUrl: '../../a2.jpg',
        featuredRental: false,
    },
    {
        headline: 'The Tower Hotel',
        numBedrooms: 3,
        numBathrooms: 1.5,
        pricePerNight: 150,
        city: 'Niagara',
        province: "Ontario",
        imageUrl: '../../a7.jpg',
        featuredRental: false,
    },
    {
        headline: 'Choice Inn by the Falls',
        numBedrooms: 7,
        numBathrooms: 4,
        pricePerNight: 250,
        city: 'Niagara',
        province: "Ontario",
        imageUrl: '../../a3.jpg',
        featuredRental: false,
    },
    {
        headline: 'Niagara Inn & Suites',
        numBedrooms: 5,
        numBathrooms: 3,
        pricePerNight: 250,
        city: 'Niagara',
        province: "Ontario",
        imageUrl: '../../a4.jpg',
        featuredRental: true,
    },
    {
        headline: "Hipwell's Motel",
        numBedrooms: 3,
        numBathrooms: 1.5,
        pricePerNight: 80,
        city: 'Niagara',
        province: "Ontario",
        imageUrl: '../../a6.jpg',
        featuredRental: true,
    }
];


// [ {
//     “cityProvince”: “Scugog, Ontario”,
//     “rentals”: [
//     { headline: “Rental 1”, city: “Scugog”, province: “Ontario”, … “featuredRental”: true },
//     { headline: “Rental 2”, city: “Scugog”, province: “Ontario”, … “featuredRental”: false }
//    ] },
module.exports.getFeaturedRentals = function(){
    return rental_obj.filter((rental)=>rental.featuredRental);
};
module.exports.getRentalsByCityAndProvince = function(){
    let rentals = [];
    rental_obj.forEach((rental)=>{
        let isDone = false;
        rentals.forEach((obj)=>{
            if (obj.cityProvince == `${rental.city}, ${rental.province}`) {
                obj?.rentals.push(rental);
                isDone = true;
            }
        })
        if (!isDone) {
            let temp = {
                cityProvince: `${rental.city}, ${rental.province}`,
                rentals: [rental]
            };
            rentals.push(temp);
        }
    })
    return rentals;
}