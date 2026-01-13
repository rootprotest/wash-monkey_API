const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  fullName: { type: String,  },
  phone: { type: String,  },
  companyName: { type: String, default: null },
  street: { type: String,  },
  city: { type: String,  },
  isMain: { type: Boolean, default: false },
  state: { type: String,  },
  pinCode: { type: String,  },
  email: { type: String,  },
  typeAddress: { type: String,  },
  latitude: { type: Number, default: null },   // added latitude
  longitude: { type: Number, default: null }   // added longitude
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;
