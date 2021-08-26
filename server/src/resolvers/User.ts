import { Users } from "../entities/User";
import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import argon2 from "argon2";

import { UserInput } from "./UserInput";
import { validateRegister } from "../utils/vaildateRegister";
import { MyContext } from "src/types";
import { __prod__ } from "../constants";
import { createAccessToken, createRefreshToken } from "../utils/auth";
import { isAuth } from "../middleware/isAuthMiddleware";
import { sendRefreshToken } from "../utils/sendRefreshToken";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Users, { nullable: true })
  user?: Users;

  @Field({ nullable: true })
  accessToken?: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi";
  }

  //Protected Route
  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    return `Your user id is: ${payload?.userId}`;
  }

  //Make this role: admin only
  @Mutation(()=> Boolean)
  async revokeRefreshTokensForUser(
    @Arg('userId', () => Int) userId: number
  ) {
    await getConnection().getRepository(Users).increment({id: userId}, 'tokenVersion', 1)
    
    return true
  }
  


  @Mutation(() => UserResponse)
  async register(@Arg("options") options: UserInput): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);

    const user = Users.create({
      email: options.email,
      password: hashedPassword,
    });
    try {
      await user.save();
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "This email already is associated with an account",
            },
          ],
        };
      }
      console.log("message:", err);
    }

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserInput,
    @Ctx() { res }: MyContext
  ): Promise<UserResponse> {
    const user = await Users.findOne({ where: { email: options.email } });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username does not exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password is wrong",
          },
        ],
      };
    }

    //Login success
    //Access token should be set to something shorter
    //refresh token is longer and when it expires it auto logs them out (7days)

 sendRefreshToken(res, createRefreshToken(user))

    return {
      // user,
      accessToken: createAccessToken(user),
    };
  }
}

//Equivalent of this:
// typeDefs: `
// type Query {
//   hello: String!
// }
// `,
// resolvers: {
//   Query: {
//     hello: () => "hello world",
//   },
// },
