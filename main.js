// GLOBAL Variables
const input = document.querySelector('input.add-todo');
const API = 'http://localhost:3000/todos';
const ul = document.querySelector('.list-unstyled');
const todosCountElement = document.querySelector('.count-todos');

/* 
    Step #1
    When the user write a new TODO and press enter,
    We want to do a POST request to the API.
*/
input.addEventListener('keyup', function (e) {
    // When the user press the ENTER key
    if (e.keyCode === 13) {
        // Get the input value
        const theInputValue = input.value;

        // Make the object that will be saved in the DB
        const obj = {
            text: theInputValue,
            status: false,
            created_at: new Date()
        };

        // Do the POST request!
        fetch(API, {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(res => res.json())
            .then(response => {
                // Append the new created todo
                const li = `
                    <li class="ui-state-default">
                        <div class="checkbox">
                            <label class="input-label" data-id="${response.id}">
                                <input type="checkbox" ${response.status === true ? 'checked' : ''} />
                                <p>${ response.text}</p>
                                <span class="date">${formatDate(response.created_at)}</span>
                            </label>
                        </div>
                        <input class="edit" type="text" style="display: none" value="${response.text}" />
                        <button
                        data-id="${response.id}"
                        class="btn btn-warning"
                        >edit</button>
                        <button
                            data-id="${response.id}"
                            class="btn btn-danger"
                        >x</button>
                        <button
                            data-id="${response.id}"
                            style="display: none"
                            class="btn btn-success"
                        >save</button>
                    </li>
                `;
                ul.innerHTML += li;

                // Rest the input
                input.value = '';

                // Update the items counter
                const oldCount = parseInt(todosCountElement.innerHTML);
                const newCount = oldCount + 1;
                todosCountElement.innerHTML = newCount;
            });
    }
});

/*
    Step #2
    On page load we want to GET all the data from the API
*/
fetch(API)
    .then(res => res.json())
    .then(data => {
        // update items counter with the array length
        const todosCount = data.length;
        todosCountElement.innerHTML = todosCount;

        // Loop over the array and for each todo we will create a new li
        data.forEach((todo, index) => {
            const li = `
                <li class="ui-state-default">
                    <div class="checkbox">
                        <label class="input-label" data-id="${todo.id}">
                            <input type="checkbox" ${todo.status === true ? 'checked' : ''} />
                            <p>${ todo.text}</p>
                            <span class="date">${formatDate(todo.created_at)}</span>
                        </label>
                    </div>
                    <input type="text" style="display: none" value="${todo.text}" />
                    <button
                    data-id="${todo.id}"
                    class="btn btn-warning"
                    >edit</button>
                    <button
                        data-id="${todo.id}"
                        class="btn btn-danger"
                    >x</button>
                    <button
                        data-id="${todo.id}"
                        style="display: none"
                        class="btn btn-success"
                    >save</button>
                </li>
            `;
            ul.innerHTML += li;
        });
    });


// This is handling the EVENT BUBBLING
// REF: https://medium.com/@vsvaibhav2016/event-bubbling-and-event-capturing-in-javascript-6ff38bec30e
ul.addEventListener('click', function (e) {
    /*
        Step #3
        When user clicks on delete button we will make a DELETE request
    */
    if (e.target.classList.contains('btn-danger')) {
        const id = e.target.getAttribute('data-id');
        // console.log('delete btn was clicked with the id of ' + id);
        fetch(API + '/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(res => res.json())
            .then(data => {
                // Remove the li
                e.target.parentNode.remove();

                // Update the items counter
                const oldCount = parseInt(todosCountElement.innerHTML);
                const newCount = oldCount - 1;
                todosCountElement.innerHTML = newCount;
            });
    }

    if (e.target.classList.contains('input-label')) {
        /*
            Step #4
            When the user clicks on the input label we want to update the status of this todo
        */
        const id = e.target.getAttribute('data-id');
        // Get the checkbox element
        const checkbox = e.target.querySelector('input[type="checkbox"]');

        const obj = {
            status: !checkbox.checked // Reverse the status of the checkbox
        };

        fetch(API + '/' + id, {
            method: 'PATCH',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(res => res.json())
            .then(data => {
                // console.log(data);
            });
    }


    /*
        Step #5
        When the user clicks on the edit button we want to show the input and hide the buttons
        and show the save button
    */
    if (e.target.classList.contains('btn-warning')) {
        const parent = e.target.parentNode;

        // Hide some stuff
        parent.querySelector('.btn-warning').style.display = 'none';
        parent.querySelector('.btn-danger').style.display = 'none';
        parent.querySelector('.checkbox').style.display = 'none';


        // Show some stuff
        parent.querySelector('input[type="text"]').style.display = 'block';
        parent.querySelector('.btn-success').style.display = 'block';
    }

    /*
        Step #6
        When the user clicks on the save button we want to make a PATCH request
    */
    if (e.target.classList.contains('btn-success')) {
        const id = e.target.getAttribute('data-id');
        const parent = e.target.parentNode;
        // we need the new text that the user wrote
        const value = parent.querySelector('input[type="text"]').value;

        const obj = {
            text: value
        };

        // we want to make a PATCH request to update the text the DB
        fetch(API + '/' + id, {
            method: 'PATCH',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(res => res.json())
            .then(data => {
                // Hide some stuff
                parent.querySelector('.btn-warning').style.display = 'inline-block';
                parent.querySelector('.btn-danger').style.display = 'inline-block';
                parent.querySelector('.checkbox').style.display = 'block';
                // Show some stuff
                parent.querySelector('input[type="text"]').style.display = 'none';
                parent.querySelector('.btn-success').style.display = 'none';

                // Update the text of the li to make it feels like AJAX 🤘
                parent.querySelector('.input-label > span').innerHTML = value;
            });
    }
});



// This is a helper function to help us formate the date!
function formatDate(date) {
    date = new Date(date);
    var monthNames = [
        "Jan", "Febr", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sept", "Oct",
        "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return "Time:" + date.getHours(- 12) + ' ' + date.getMinutes() + ' ' + day + '  ' + monthNames[monthIndex] + ':' + year;
}