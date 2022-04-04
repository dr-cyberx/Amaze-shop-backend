import authMutations from './mutation/auth';
import cartMutations from './mutation/cart';
import ProductMutations from './mutation/Product';
import otpQueries from './query/auth';
import { getCartByUserID } from './query/cart';
import { productquery } from './query/Product';
import { getAllUser } from './query/user';

const resolvers = {
  Query: {
    hello: () => 'hello world ',
    getAllUser,
    getCartByUserID,
    ...productquery,
    ...otpQueries,
  },
  Mutation: {
    ...authMutations,
    ...ProductMutations,
    ...cartMutations,
  },
};

export default resolvers;
