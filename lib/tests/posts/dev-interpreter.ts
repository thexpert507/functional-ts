import { baseInterpreter, handler, interpreter, match, maybe, nothing } from "../../monads";
import { Email, Post, User } from "./interfaces";

const findAllPosts = handler<Post[]>((program) => {
  return maybe(program.run([]));
});

const findUserByPost = handler<User, Post>((program) => {
  return nothing<User>();
});

const sendEmail = handler<void, Email>((program) => {
  return nothing<void>();
});

export const devInterpreter = baseInterpreter().chain(
  interpreter(
    match("find-all-posts").from(findAllPosts),
    match("find-user-by-post").from(findUserByPost),
    match("send-email").from(sendEmail)
  )
);
