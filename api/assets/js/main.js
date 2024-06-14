
const toggleMenu = (menuStatus) =>
{
    let navLinks = document.getElementById('nav-links');
    console.log('toggleMenu called');

    if (!menuStatus)
    {
        scrollToTop();
        navLinks.style.right = '0%';
    }
    else
    {
        scrollToTop();
        navLinks.style.right = '-200%';
    }
}

//scroll to top
const scrollToTop = () =>
{
    window.scrollTo(0, 0);
}
