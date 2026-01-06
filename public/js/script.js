// dom manipulation
document.addEventListener('DOMContentLoaded',function(){
    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');

    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].addEventListener('click',function(){
            // null guard
            if (!searchBar || !searchInput) return;

            searchBar.style.visibility = 'visible';
            searchBar.classList.add('open');
            this.setAttribute('aria-expanded','true');
            //Move page to button when button is clicked
            searchInput.focus();
        });
    }

    // null guard
    if (searchBar && searchInput && searchClose){
        searchClose.addEventListener('click',function(){
            searchBar.style.visibility = 'hidden';
            searchBar.classList.remove('open');
            this.setAttribute('aria-expanded','true');
    });
    }

    // register button
    const registerBtn = document.getElementById('register_btn');

    if (!registerBtn) return;

    registerBtn.addEventListener('click', () => {
        window.location.href = '/admin/register';
    });

});
