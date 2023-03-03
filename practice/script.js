;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }
  const getAll = (target) => {
    return document.querySelectorAll(target)
  }

  const $todos = get('.todos')
  const $form = get('.todo_form')
  const $todoInput = get('.todo_input')
  const API_URL = `http://localhost:3000/todos`
  const $pagination = get('.pagination')

  //페이지네이션
  const limit = 5
  let currentPage = 8
  const totalCount = 53
  const pageCount =5

  //페이지네이션
  const pagination = () => {
    //총 페이지 갯수 계산
    let totalPage = Math.ceil(totalCount / limit)
    //현재 위치한 페이지가 속한 그룹 계산 {group 1=12345 , group 2= 678910 ...}
    let pageGroup = Math.ceil(currentPage / pageCount)

    //pageGroup당 첫번째, 마지막 숫자 구하기(1-5,6-10,7-11)
    let lastNumber = pageGroup * pageCount // 1*5=5, 2*5=10, 3*5=15
    if (lastNumber > totalPage) { // 15 > 11이면
      lastNumber = totalPage // 15가 아니라 11을 마지막 페이지로 해라
    }
    let firstNumber = lastNumber - (pageCount - 1) // 첫번째 페이지는 5-4=1, 10-4=6, 11-4=7

    const next = lastNumber + 1
    const prev = firstNumber - 1 

    //html 만들어 뿌리기
    let html = ''
    //1.이전
    if (prev > 0){
      html += "<button class='prev' data-fn='prev'>이전</button>"
    }
    //2.숫자
    for(let i = firstNumber; i <= lastNumber; i++){
      html += `<button class="pageNumber" id="page_${i}">${i}</button>`
    }
    //3.다음
    if (lastNumber < totalPage){
      html += `<button class='next' data-fn='next'>다음</button>`
    }

    $pagination.innerHTML = html

    //4.현재 위치한 페이지의 숫자에 차별점 두기
    const $currentPageNumber = get(`.pageNumber#page_${currentPage}`)
    console.log($pagination)
    $currentPageNumber.style.color = '#9dc0e8'
    console.log("2222 :: ",$currentPageNumber.style.color)
    console.log("2222 :: ",$pagination)
    //5.버튼 클릭 이벤트
    const $currentPageNumbers = getAll(`.pagination button`)
    $currentPageNumbers.forEach(button => {
      button.addEventListener('click', () => {
        if(button.dataset.fn === 'prev'){
          currentPage = prev
        }else if(button.dataset.fn === 'next'){
          currentPage = next
        }else {
          currentPage = button.innerText
        }
        pagination()
        getTodos()
      })
    })
  }

  // const pagination = () => {
  //   let totalPage = Math.ceil(totalCount / limit)
  //   let pageGroup = Math.ceil(currentPage / pageCount)
  //   let lastNumber = pageGroup * pageCount
  //   if (lastNumber > totalPage) {
  //     lastNumber = totalPage
  //   }
  //   let firstNumber = lastNumber - (pageCount - 1)

  //   const next = lastNumber + 1
  //   const prev = firstNumber - 1

  //   let html = ''

  //   if (prev > 0) {
  //     html += "<button class='prev' data-fn='prev'>이전</button> "
  //   }

  //   for (let i = firstNumber; i <= lastNumber; i++) {
  //     html += `<button class="pageNumber" id="page_${i}">${i}</button>`
  //   }
  //   if (lastNumber < totalPage) {
  //     html += `<button class='next' data-fn='next'>다음</button>`
  //   }

  //   $pagination.innerHTML = html
  //   const $currentPageNumber = get(`.pageNumber#page_${currentPage}`)
  //   $currentPageNumber.style.color = '#9dc0e8'

  //   const $currentPageNumbers = getAll(`.pagination button`)
  //   $currentPageNumbers.forEach((button) => {
  //     button.addEventListener('click', () => {
  //       if (button.dataset.fn === 'prev') {
  //         currentPage = prev
  //       } else if (button.dataset.fn === 'next') {
  //         currentPage = next
  //       } else {
  //         currentPage = button.innerText
  //       }
  //       pagination()
  //       getTodos()
  //     })
  //   })
  // }

  const createTodoElement = (item) => {
    const { id, content, completed } = item
    const isChecked = completed ? 'checked' : ''
    const $todoItem = document.createElement('div')
    $todoItem.classList.add('item')
    $todoItem.dataset.id = id
    $todoItem.innerHTML = `
            <div class="content">
              <input
                type="checkbox"
                class='todo_checkbox' 
                ${isChecked}
              />
              <label>${content}</label>
              <input type="text" value="${content}" />
            </div>
            <div class="item_buttons content_buttons">
              <button class="todo_edit_button">
                <i class="far fa-edit"></i>
              </button>
              <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
            <div class="item_buttons edit_buttons">
              <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
              </button>
              <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
              </button>
            </div>
      `
    return $todoItem
  }

  const renderAllTodos = (todos) => {
    $todos.innerHTML = ''
    todos.forEach((item) => {
      const todoElement = createTodoElement(item)
      $todos.appendChild(todoElement)
    })
  }

  const getTodos = () => {
    fetch(`${API_URL}?_page=${currentPage}&_limit=${limit}`)
      .then((response) => response.json())
      .then((todos) => {
        renderAllTodos(todos)
      })
      .catch((error) => console.error(error.message))
  }

  const addTodo = (e) => {
    e.preventDefault()
    const content = $todoInput.value
    if (!content) return
    const todo = {
      content,
      completed: false,
    }
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(todo),
    })
      .then((response) => response.json())
      .then(getTodos)
      .then(() => {
        $todoInput.value = ''
        $todoInput.focus()
      })
      .catch((error) => console.error(error.message))
  }

  const toggleTodo = (e) => {
    if (e.target.className !== 'todo_checkbox') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const completed = e.target.checked
    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const changeEditMode = (e) => {
    const $item = e.target.closest('.item')
    const $label = $item.querySelector('label')
    const $editInput = $item.querySelector('input[type="text"]')
    const $contentButtons = $item.querySelector('.content_buttons')
    const $editButtons = $item.querySelector('.edit_buttons')
    const value = $editInput.value

    if (e.target.className === 'todo_edit_button') {
      $label.style.display = 'none'
      $editInput.style.display = 'block'
      $contentButtons.style.display = 'none'
      $editButtons.style.display = 'block'
      $editInput.focus()
      $editInput.value = ''
      $editInput.value = value
    }

    if (e.target.className === 'todo_edit_cancel_button') {
      $label.style.display = 'block'
      $editInput.style.display = 'none'
      $contentButtons.style.display = 'block'
      $editButtons.style.display = 'none'
      $editInput.value = $label.innerText
    }
  }

  const editTodo = (e) => {
    if (e.target.className !== 'todo_edit_confirm_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const $editInput = $item.querySelector('input[type="text"]')
    const content = $editInput.value

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const removeTodo = (e) => {
    if (e.target.className !== 'todo_remove_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const init = () => {
    window.addEventListener('DOMContentLoaded', () => {
      getTodos()
      pagination()
    })

    $form.addEventListener('submit', addTodo)
    $todos.addEventListener('click', toggleTodo)
    $todos.addEventListener('click', changeEditMode)
    $todos.addEventListener('click', editTodo)
    $todos.addEventListener('click', removeTodo)
  }

  init()
})()
