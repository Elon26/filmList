import { filmsMock } from "./filmsMock.js"

const ALL_FILMS = 'all_films'
const FAVOURITE_FILMS = 'favourite_films'

// Инициализируем localStorage

if (!fromStorage(ALL_FILMS) && !fromStorage(FAVOURITE_FILMS)) {
	toStorage(ALL_FILMS, filmsMock)
	toStorage(FAVOURITE_FILMS, [])
}

// ======================================

// Отрисовываем список фильмов

const storagedFilms = fromStorage(ALL_FILMS)
renderFilmsList(storagedFilms, ALL_FILMS)

// Логика переключения разделов Все фильмы / Избранные фильмы
const favouriteFilmsBtn = document.querySelector('.film-cards-container__favourite-films')
favouriteFilmsBtn.addEventListener('click', () => handleFilmsListSwitch(favouriteFilmsBtn))

// ======================================

function toStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value))
}

function fromStorage(key) {
	return JSON.parse(localStorage.getItem(key))
}

// Функция отрисовки списка фильмов
function renderFilmsList(filmsList, listType) {
	const favouriteFilmsButtonHTML = document.querySelector('.film-cards-container__favourite-films')

	favouriteFilmsButtonHTML.insertAdjacentHTML('afterend', `
	<div id="${listType}" class="film-cards-container"></div>
	`)

	const filmsContainer = document.querySelector('.film-cards-container')

	// Отрисовываем список фильмов
	if (filmsList.length) {
		filmsList.forEach(film => renderFilmCard(film, filmsContainer))
	} else {
		filmsContainer.innerHTML = '<div>Список пуст</div>'
	}


	// Устанавливаем слушатели кликов по кнопке добавления в избранное
	const likeBtns = document.querySelectorAll('.film-card__button')
	likeBtns.forEach((btn, i) => btn.addEventListener('click', () => handleLikeButtonClick(filmsList, listType, i)))

	// Устанавливаем слушатели кликов для открытия/закрытия модального окна
	const filmsTitles = document.querySelectorAll('.film-card__title')
	filmsTitles.forEach((title, i) => title.addEventListener('click', () => {
		const clickedFilm = filmsList[i]
		renderFilmModal(clickedFilm, filmsContainer)

		const closeModalBtn = document.querySelector('.close-modal ')
		closeModalBtn.addEventListener('click', () => {
			const modal = document.querySelector('.modal')
			modal.remove()
		}, { once: true })
	}))
}

// Функция отрисовки карточки фильма
function renderFilmCard(film, targetContainer) {
	const { imgUrl, movieName, releaseYear, isFavourite } = film

	const btnImg = isFavourite ? 'favourite.png' : 'notFavourite.png'
	targetContainer.insertAdjacentHTML('beforeend', `
	<div class="film-card">
			<img src="${imgUrl}" class="film-card__poster"></img>
			<div class="film-card__title">${movieName}</div>
			<div class="film-card__year">${releaseYear}</div>
			<button class="film-card__button">
				<img class="film-card__button-img" src="./assets/img/${btnImg}" alt="">
			</button>
		</div>
	`)
}

// Функция отрисовки модального окна
function renderFilmModal(clickedFilm, targetContainer) {
	const { imgUrl, movieName, releaseYear, isFavourite, description } = clickedFilm

	const btnImg = isFavourite ? 'favourite.png' : 'notFavourite.png'
	targetContainer.insertAdjacentHTML('afterend', `
	<div class="modal">
		<div class="modal-content">
			<div class="close-modal">
				<img class="close-modal-icon" src="./assets/img/cross.png" alt="">
			</div>

			<img src="${imgUrl}" class="film-card__poster"></img>
			<div class="film-card__title">${movieName}</div>
			<div class="film-card__year">${releaseYear}</div>
			<div class="film-card__description">${description}</div>
			<button class="film-card__button">
				<img class="film-card__button-img" src="./assets/img/${btnImg}" alt="">
			</button>
		</div>
	</div>
	`)
}

// Функция-обработчик для кнопки добавления в избранное
function handleLikeButtonClick(filmsList, listType, i) {
	filmsList[i].isFavourite = !filmsList[i].isFavourite

	const sortedFilmsList = sortByIsFavorite(filmsList)
	const sortedFavoriteFilmsList = sortFavoriteFilms(sortedFilmsList)

	const filmsListContainer = document.getElementById(listType)

	switch (listType) {
		case ALL_FILMS:
			toStorage(ALL_FILMS, sortedFilmsList)
			toStorage(FAVOURITE_FILMS, sortedFavoriteFilmsList)
			filmsListContainer.remove()
			renderFilmsList(sortedFilmsList, listType)
			return

		case FAVOURITE_FILMS:
			const newAllFilmsList = fromStorage(ALL_FILMS)
			newAllFilmsList[i].isFavourite = !newAllFilmsList[i].isFavourite
			toStorage(ALL_FILMS, sortByIsFavorite(newAllFilmsList))

			toStorage(FAVOURITE_FILMS, sortedFavoriteFilmsList)
			filmsListContainer.remove()
			renderFilmsList(sortedFavoriteFilmsList, listType)
			return

		default:
			return
	}
}

function sortByIsFavorite(films) {
	return films.sort((a, b) => a.id - b.id).sort(a => a.isFavourite ? -1 : 1)
}

function sortFavoriteFilms(films) {
	return films.filter(film => film.isFavourite).sort((a, b) => b.id - a.id)
}

// Переключатель списков
function handleFilmsListSwitch(switcherBtn) {
	const filmsContainer = document.querySelector('.film-cards-container')

	const filmsCardContainerTitle = document.querySelector('.film-cards-container__title')

	switch (filmsContainer.id) {
		case ALL_FILMS:
			filmsContainer.remove()
			filmsCardContainerTitle.innerHTML = 'Favorite Films'
			switcherBtn.innerHTML = 'See All Films'
			renderFilmsList(fromStorage(FAVOURITE_FILMS), FAVOURITE_FILMS)
			return

		case FAVOURITE_FILMS:
			filmsContainer.remove()
			filmsCardContainerTitle.innerHTML = 'All Films'
			switcherBtn.innerHTML = 'See Favorite Films'
			renderFilmsList(fromStorage(ALL_FILMS), ALL_FILMS)
			return

		default:
			return
	}
}