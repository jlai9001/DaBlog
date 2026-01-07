// dom manipulation
document.addEventListener('DOMContentLoaded',function(){
    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchForm = document.querySelector('.search__form');

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

    // close button
    if (searchBar && searchInput && searchClose){
        searchClose.addEventListener('click',function(){
        closeSearch();
        });
    }
    // empty search interception
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function (e) {
        const value = searchInput.value.trim();

        // Empty search = behave like close
        if (!value) {
            e.preventDefault();
            closeSearch();
        }
    });
}

    // close search
    function closeSearch() {
        if (!searchBar || !searchInput) return;
        searchBar.style.visibility = 'hidden';
        searchBar.classList.remove('open');
        searchInput.value = '';
        searchInput.blur();
        allButtons.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        });
    }

    // register button
    const registerBtn = document.getElementById('register_btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = '/admin/register';
        });
    }

});
