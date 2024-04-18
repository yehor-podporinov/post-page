const POST_ID = '1'
const COMMENT_CREATION_INPUT_ELEMENT_ID = 'comment-creation-input'
const POST_COMMENTS_LIST_ELEMENT_ID = 'post-comments'
const POST_COMMENTS_LIST_ELEMENT_CLASS = 'post-comments'
const POST_ADDITION_COMMENT_CONTROL_ELEMENT_ID = 'post-addition-comment-control'
const POST_ADDITION_COMMENT_CONTROL_VALUE_ELEMENT_ID = 'post-addition-comment-control-value'
const REPLY_CREATION_ELEMENT_ID = 'reply-creation'
const REPLY_CREATION_INPUT_ELEMENT_ID = 'reply-creation-input'
const POST_COMMENT_ELEMENT_PREFIX_ID = 'post-comment-'
const POST_COMMENT_REPLY_CONTROL_ELEMENT_PREFIX_ID = 'post-comment-reply-control-'

class Profile {
  id
  name
  imageSrc

  constructor({ name, imageSrc }) {
    this.id = generateUid()
    this.name = name
    this.imageSrc = imageSrc
  }
}

class PostComment {
  id
  postId
  senderId
  content
  createdAt
  replyToId

  constructor({ postId, senderId, content, createdAt = new Date().toISOString(), replyToId = '' }) {
    this.id = generateUid()
    this.postId = postId
    this.senderId = senderId
    this.content = content
    this.createdAt = createdAt
    this.replyToId = replyToId
  }
}

const userProfile = new Profile({ name: 'SubSub Moderator', imageSrc: '/mock/user-profile-image.webp' })

const profiles = [
  new Profile({ name: 'Emily Fray', imageSrc: '/mock/profile-image-1.webp' }),
  new Profile({ name: 'Esther Howard', imageSrc: '/mock/profile-image-2.webp' }),
  userProfile,
]

const postComments = [
  new PostComment({
    postId: POST_ID,
    senderId: profiles[0].id,
    content: 'Really cool! ✌ I love it!🌏',
    createdAt: '2024-04-17T22:00:00.000Z',
  }),
  new PostComment({
    postId: POST_ID,
    senderId: profiles[1].id,
    content: 'I would also love to visit there! The best place for me. Will definitely go back there again with my family ☘️💕',
    createdAt: '2024-04-18T22:00:00.000Z',
  }),
]

const postCommentsProxy = new Proxy(postComments, {
  set(target, p, newValue, receiver) {
    if (newValue instanceof PostComment) {
      renderPostComment(newValue)
      renderPostAdditionCommentControlValueElement(postCommentsProxy.length + 1)
    }

    return Reflect.set(target, p, newValue, receiver)
  },
})

const commentCreationInputElement = document.querySelector(`#${COMMENT_CREATION_INPUT_ELEMENT_ID}`)
const postCommentsListElement = document.querySelector(`#${POST_COMMENTS_LIST_ELEMENT_ID}`)
const postAdditionControlElement = document.querySelector(`#${POST_ADDITION_COMMENT_CONTROL_ELEMENT_ID}`)
let postAdditionCommentControlValueElement = document.querySelector(`#${POST_ADDITION_COMMENT_CONTROL_VALUE_ELEMENT_ID}`)

postCommentsListElement.innerHTML = ''
postComments.forEach(postComment => renderPostComment(postComment))

commentCreationInputElement.addEventListener('keydown', onCommentCreationInputKeydown)
postCommentsListElement.addEventListener('click', onPostCommentsListClick)
postCommentsListElement.addEventListener('keydown', onPostCommentsListKeydown)

window.addEventListener('beforeunload', function onBeforeunload() {
  commentCreationInputElement.removeEventListener('keydown', onCommentCreationInputKeydown)
  postCommentsListElement.removeEventListener('click', onPostCommentsListClick)
  postCommentsListElement.removeEventListener('keydown', onPostCommentsListKeydown)
  window.removeEventListener('beforeunload', onBeforeunload)
})

function onCommentCreationInputKeydown(event) {
  if (event.key !== 'Enter' || !event.target.value) return

  const postComment = new PostComment({
    postId: POST_ID,
    senderId: userProfile.id,
    content: event.target.value,
  })

  postCommentsProxy.push(postComment)
  event.target.value = ''
}

function onPostCommentsListClick(event) {
  const postCommentReplyControlElement = event.target.closest(`[id^=${POST_COMMENT_REPLY_CONTROL_ELEMENT_PREFIX_ID}]`)
  if (postCommentReplyControlElement) renderReplyCreationElement(postCommentReplyControlElement)
}

function onPostCommentsListKeydown(event) {
  if (event.key !== 'Enter' || event.target.id !== REPLY_CREATION_INPUT_ELEMENT_ID || !event.target.value) return

  const postCommentElement = event.target.closest(`li[id^=${POST_COMMENT_ELEMENT_PREFIX_ID}]`)
  const postCommentId = postCommentElement.id.slice(POST_COMMENT_ELEMENT_PREFIX_ID.length)
  const postComment = postComments.find(({ id }) => id === postCommentId)

  const initialPostComment = getInitialPostComment(postComment)

  const replyPostComment = new PostComment({
    postId: POST_ID,
    senderId: userProfile.id,
    content: event.target.value,
    replyToId: initialPostComment.id,
  })

  postCommentsProxy.push(replyPostComment)
  event.target.closest(`div[id^=${REPLY_CREATION_ELEMENT_ID}]`).remove()

  console.log('postComments', postComments)
  console.log('initialPostComment.id', initialPostComment.id)
}

function renderPostComment(postComment) {
  let listElement = postCommentsListElement

  if (postComment.replyToId) {
    const initialPostComment = postComments.find(({ id }) => id === postComment.replyToId)
    const initialPostCommentElement = document.querySelector(`#${POST_COMMENT_ELEMENT_PREFIX_ID}${initialPostComment.id}`)

    listElement = initialPostCommentElement.querySelector(`.${POST_COMMENTS_LIST_ELEMENT_CLASS}`)
    if (!listElement) {
      listElement = document.createElement('ul')
      listElement.className = POST_COMMENTS_LIST_ELEMENT_CLASS
      initialPostCommentElement.append(listElement)
    }
  }

  const senderProfile = profiles.find(({ id }) => id === postComment.senderId)

  const element = document.createElement('li')
  element.id = `${POST_COMMENT_ELEMENT_PREFIX_ID}${postComment.id}`
  element.className = 'post-comment'
  element.innerHTML = `<div class="post-comment__wrp">
      <img class="post-comment__profile-image" src="${senderProfile.imageSrc}" alt="comment-profile-image" />
      <div>
        <h1 class="font-semi">${senderProfile.name}</h1>
        <p class="post-comment__content">${postComment.content}</p>
        <div class="post-comment__controls">
          <button class="post-comment__control" aria-label="I like">
            <svg class="post-comment__control-icon" aria-hidden="true">
              <use href="/assets/icons/heart-icon.svg#id" />
            </svg>
          </button>
          <button class="post-comment__control" id="${POST_COMMENT_REPLY_CONTROL_ELEMENT_PREFIX_ID}${postComment.id}" aria-label="Reply">
            <svg class="post-comment__control-icon" aria-hidden="true">
              <use href="/assets/icons/reply-icon.svg#id" />
            </svg>
          </button>
        </div>
      </div>
      <time class="post-comment__date">${formatDate(postComment.createdAt)}</time>
    </div>`

  listElement.append(element)
}

function renderPostAdditionCommentControlValueElement(amount) {
  if (postAdditionCommentControlValueElement) {
    postAdditionCommentControlValueElement.innerHTML = String(amount)
  } else {
    postAdditionCommentControlValueElement = document.createElement('span')
    postAdditionCommentControlValueElement.id = POST_ADDITION_COMMENT_CONTROL_VALUE_ELEMENT_ID
    postAdditionCommentControlValueElement.innerHTML = String(amount)
    postAdditionControlElement.append(postAdditionCommentControlValueElement)
  }
}

function renderReplyCreationElement(postCommentReplyControlElement) {
  const postCommentId = postCommentReplyControlElement.id.slice(POST_COMMENT_REPLY_CONTROL_ELEMENT_PREFIX_ID.length)
  const postComment = postComments.find(({ id }) => id === postCommentId)

  const initialPostComment = getInitialPostComment(postComment)
  const initialPostCommentElement = document.querySelector(`[id^=${POST_COMMENT_ELEMENT_PREFIX_ID}${initialPostComment.id}]`)

  const postCommentSenderProfile = profiles.find(({ id }) => id === postComment.senderId)

  let element = document.querySelector(`#${REPLY_CREATION_ELEMENT_ID}`)
  if (!element) {
    element = document.createElement('div')
    element.id = REPLY_CREATION_ELEMENT_ID
    element.className = 'reply-creation'
    element.innerHTML = `
      <img class="reply-creation__image" src="${userProfile.imageSrc}" alt="profile-image">
      <input class="input" placeholder="Reply here..." enterkeyhint="enter" id="${REPLY_CREATION_INPUT_ELEMENT_ID}" />
    `
  }

  initialPostCommentElement.append(element)
  const inputElement = element.querySelector(`#${REPLY_CREATION_INPUT_ELEMENT_ID}`)
  inputElement.value = postCommentSenderProfile !== userProfile ? `${postCommentSenderProfile.name}, ` : ''
  inputElement.focus()
}

function getInitialPostComment(postComment) {
  if (!postComment.replyToId) return postComment
  const initialPostComment = postCommentsProxy.find(({ id }) => id === postComment.replyToId)
  return getInitialPostComment(initialPostComment)
}

function generateUid() {
  return String(Math.round(Math.random() * 1000000))
}

function formatDate(dateISOString) {
  const ONE_DAY_TIMESTAMP = 86400
  const timestampSub = (new Date() - new Date(dateISOString)) / 1000
  const daysSub = Math.floor(timestampSub / ONE_DAY_TIMESTAMP)
  return daysSub ? `${daysSub}d` : 'today'
}
