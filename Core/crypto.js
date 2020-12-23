const crypto = require('crypto');
String.prototype.tomd5 = function()
{
	var stream = exports['md5']();
	stream.update(this.toString(),"utf8");
	return stream.digest("hex");
};
String.prototype.tohex = function(){
	return Buffer(this.toString()).toString("hex")
};
String.prototype.hex = function(){
	return Buffer(this,"latin1").toString("hex")
};



Buffer.prototype.tohex = function(){
	return this.toString("hex")
};
Buffer.prototype.tomd5 = function()
{
	return md5(this);
};
Buffer.prototype.aes128encrypt = function(password,encoding)
{
	return Aes128encrypt(this,password,encoding);
};
Buffer.prototype.aes128decrypt = function(password,encoding)
{
	return Aes128decrypt(this,password,encoding);
};
exports.randomBytes = global.saferandom = function(b16){
	return crypto.randomBytes(b16||16);
};

exports.randomHex = function(b16){
	return crypto.randomBytes((b16 && b16/2)||16).toString("hex");
};

function Hashing(algorithm){
	return ()=>{
		return crypto.createHash(algorithm);
	}
};
function Crypting(algorithm,ivlength){
	return {
		/**
		 * @param {String} password
		 * @returns {crypto.Cipher}
		 */
		"Cipher":(password)=>{
			const key = crypto.scryptSync(password, 'salt', ivlength);
			const iv = Buffer.alloc(ivlength, 0);
			return crypto.createCipheriv(algorithm, key, iv);
		},
		/**
		 * @param {String} password
		 * @returns {crypto.Decipher}
		 */
		"Decipher":(password)=>{
			const key = crypto.scryptSync(password, 'salt', ivlength);
			const iv = Buffer.alloc(ivlength, 0);
			return crypto.createDecipheriv(algorithm, key, iv);
		} 
	}
};
//Crypto with key on data
exports.SupportedCrypting = [
	"aes-128-cbc",
	"aes-128-cbc-hmac-sha1",
	"aes-128-cbc-hmac-sha256",
	"aes-128-ccm",
	"aes-128-cfb",
	"aes-128-cfb1",
	"aes-128-cfb8",
	"aes-128-ctr",
	"aes-128-ecb",
	"aes-128-gcm",
	"aes-128-ocb",
	"aes-128-ofb",
	"aes-128-xts",
	"aes-192-cbc",
	"aes-192-ccm",
	"aes-192-cfb",
	"aes-192-cfb1",
	"aes-192-cfb8",
	"aes-192-ctr",
	"aes-192-ecb",
	"aes-192-gcm",
	"aes-192-ocb",
	"aes-192-ofb",
	"aes-256-cbc",
	"aes-256-cbc-hmac-sha1",
	"aes-256-cbc-hmac-sha256",
	"aes-256-ccm",
	"aes-256-cfb",
	"aes-256-cfb1",
	"aes-256-cfb8",
	"aes-256-ctr",
	"aes-256-ecb",
	"aes-256-gcm",
	"aes-256-ocb",
	"aes-256-ofb",
	"aes-256-xts",
	"aes128",
	"aes128-wrap",
	"aes192",
	"aes192-wrap",
	"aes256",
	"aes256-wrap",
	"aria-128-cbc",
	"aria-128-ccm",
	"aria-128-cfb",
	"aria-128-cfb1",
	"aria-128-cfb8",
	"aria-128-ctr",
	"aria-128-ecb",
	"aria-128-gcm",
	"aria-128-ofb",
	"aria-192-cbc",
	"aria-192-ccm",
	"aria-192-cfb",
	"aria-192-cfb1",
	"aria-192-cfb8",
	"aria-192-ctr",
	"aria-192-ecb",
	"aria-192-gcm",
	"aria-192-ofb",
	"aria-256-cbc",
	"aria-256-ccm",
	"aria-256-cfb",
	"aria-256-cfb1",
	"aria-256-cfb8",
	"aria-256-ctr",
	"aria-256-ecb",
	"aria-256-gcm",
	"aria-256-ofb",
	"aria128",
	"aria192",
	"aria256",
	"bf",
	"bf-cbc",
	"bf-cfb",
	"bf-ecb",
	"bf-ofb",
	"blowfish",
	"camellia-128-cbc",
	"camellia-128-cfb",
	"camellia-128-cfb1",
	"camellia-128-cfb8",
	"camellia-128-ctr",
	"camellia-128-ecb",
	"camellia-128-ofb",
	"camellia-192-cbc",
	"camellia-192-cfb",
	"camellia-192-cfb1",
	"camellia-192-cfb8",
	"camellia-192-ctr",
	"camellia-192-ecb",
	"camellia-192-ofb",
	"camellia-256-cbc",
	"camellia-256-cfb",
	"camellia-256-cfb1",
	"camellia-256-cfb8",
	"camellia-256-ctr",
	"camellia-256-ecb",
	"camellia-256-ofb",
	"camellia128",
	"camellia192",
	"camellia256",
	"cast",
	"cast-cbc",
	"cast5-cbc",
	"cast5-cfb",
	"cast5-ecb",
	"cast5-ofb",
	"chacha20",
	"chacha20-poly1305",
	"des",
	"des-cbc",
	"des-cfb",
	"des-cfb1",
	"des-cfb8",
	"des-ecb",
	"des-ede",
	"des-ede-cbc",
	"des-ede-cfb",
	"des-ede-ecb",
	"des-ede-ofb",
	"des-ede3",
	"des-ede3-cbc",
	"des-ede3-cfb",
	"des-ede3-cfb1",
	"des-ede3-cfb8",
	"des-ede3-ecb",
	"des-ede3-ofb",
	"des-ofb",
	"des3",
	"des3-wrap",
	"desx",
	"desx-cbc",
	"id-aes128-CCM",
	"id-aes128-GCM",
	"id-aes128-wrap",
	"id-aes128-wrap-pad",
	"id-aes192-CCM",
	"id-aes192-GCM",
	"id-aes192-wrap",
	"id-aes192-wrap-pad",
	"id-aes256-CCM",
	"id-aes256-GCM",
	"id-aes256-wrap",
	"id-aes256-wrap-pad",
	"id-smime-alg-CMS3DESwrap",
	"idea",
	"idea-cbc",
	"idea-cfb",
	"idea-ecb",
	"idea-ofb",
	"rc2",
	"rc2-128",
	"rc2-40",
	"rc2-40-cbc",
	"rc2-64",
	"rc2-64-cbc",
	"rc2-cbc",
	"rc2-cfb",
	"rc2-ecb",
	"rc2-ofb",
	"rc4",
	"rc4-40",
	"rc4-hmac-md5",
	"seed",
	"seed-cbc",
	"seed-cfb",
	"seed-ecb",
	"seed-ofb",
	"sm4",
	"sm4-cbc",
	"sm4-cfb",
	"sm4-ctr",
	"sm4-ecb",
	"sm4-ofb"
];

exports.SupportedHashing = [
	"RSA-MD4",
	"RSA-MD5",
	"RSA-MDC2",
	"RSA-RIPEMD160",
	"RSA-SHA1",
	"RSA-SHA1-2",
	"RSA-SHA224",
	"RSA-SHA256",
	"RSA-SHA3-224",
	"RSA-SHA3-256",
	"RSA-SHA3-384",
	"RSA-SHA3-512",
	"RSA-SHA384",
	"RSA-SHA512",
	"RSA-SHA512/224",
	"RSA-SHA512/256",
	"RSA-SM3",
	"blake2b512",
	"blake2s256",
	"id-rsassa-pkcs1-v1_5-with-sha3-224",
	"id-rsassa-pkcs1-v1_5-with-sha3-256",
	"id-rsassa-pkcs1-v1_5-with-sha3-384",
	"id-rsassa-pkcs1-v1_5-with-sha3-512",
	"md4",
	"md4WithRSAEncryption",
	"md5",
	"md5-sha1",
	"md5WithRSAEncryption",
	"mdc2",
	"mdc2WithRSA",
	"ripemd",
	"ripemd160",
	"ripemd160WithRSA",
	"rmd160",
	"sha1",
	"sha1WithRSAEncryption",
	"sha224",
	"sha224WithRSAEncryption",
	"sha256",
	"sha256WithRSAEncryption",
	"sha3-224",
	"sha3-256",
	"sha3-384",
	"sha3-512",
	"sha384",
	"sha384WithRSAEncryption",
	"sha512",
	"sha512-224",
	"sha512-224WithRSAEncryption",
	"sha512-256",
	"sha512-256WithRSAEncryption",
	"sha512WithRSAEncryption",
	"shake128",
	"shake256",
	"sm3",
	"sm3WithRSAEncryption",
	"ssl3-md5",
	"ssl3-sha1",
	"whirlpool"
];
exports['aes-128-cbc'] = Crypting('aes-128-cbc',16);
exports['aes-128-cbc-hmac-sha1'] = Crypting('aes-128-cbc-hmac-sha1',16);
exports['aes-128-cbc-hmac-sha256'] = Crypting('aes-128-cbc-hmac-sha256',16);
exports['aes-128-ccm'] = Crypting('aes-128-ccm',12);
exports['aes-128-cfb'] = Crypting('aes-128-cfb',16);
exports['aes-128-cfb1'] = Crypting('aes-128-cfb1',16);
exports['aes-128-cfb8'] = Crypting('aes-128-cfb8',16);
exports['aes-128-ctr'] = Crypting('aes-128-ctr',16);
exports['aes-128-ecb'] = Crypting('aes-128-ecb',0);
exports['aes-128-gcm'] = Crypting('aes-128-gcm',12);
exports['aes-128-ocb'] = Crypting('aes-128-ocb',12);
exports['aes-128-ofb'] = Crypting('aes-128-ofb',16);
exports['aes-128-xts'] = Crypting('aes-128-xts',16);
exports['aes-192-cbc'] = Crypting('aes-192-cbc',16);
exports['aes-192-ccm'] = Crypting('aes-192-ccm',12);
exports['aes-192-cfb'] = Crypting('aes-192-cfb',16);
exports['aes-192-cfb1'] = Crypting('aes-192-cfb1',16);
exports['aes-192-cfb8'] = Crypting('aes-192-cfb8',16);
exports['aes-192-ctr'] = Crypting('aes-192-ctr',16);
exports['aes-192-ecb'] = Crypting('aes-192-ecb',0);
exports['aes-192-gcm'] = Crypting('aes-192-gcm',12);
exports['aes-192-ocb'] = Crypting('aes-192-ocb',12);
exports['aes-192-ofb'] = Crypting('aes-192-ofb',16);
exports['aes-256-cbc'] = Crypting('aes-256-cbc',16);
exports['aes-256-cbc-hmac-sha1'] = Crypting('aes-256-cbc-hmac-sha1',16);
exports['aes-256-cbc-hmac-sha256'] = Crypting('aes-256-cbc-hmac-sha256',16);
exports['aes-256-ccm'] = Crypting('aes-256-ccm',12);
exports['aes-256-cfb'] = Crypting('aes-256-cfb',16);
exports['aes-256-cfb1'] = Crypting('aes-256-cfb1',16);
exports['aes-256-cfb8'] = Crypting('aes-256-cfb8',16);
exports['aes-256-ctr'] = Crypting('aes-256-ctr',16);
exports['aes-256-ecb'] = Crypting('aes-256-ecb',0);
exports['aes-256-gcm'] = Crypting('aes-256-gcm',12);
exports['aes-256-ocb'] = Crypting('aes-256-ocb',12);
exports['aes-256-ofb'] = Crypting('aes-256-ofb',16);
exports['aes-256-xts'] = Crypting('aes-256-xts',16);
exports['aes128'] = Crypting('aes128',16);
exports['aes128-wrap'] = Crypting('aes128-wrap',8);
exports['aes192'] = Crypting('aes192',16);
exports['aes192-wrap'] = Crypting('aes192-wrap',8);
exports['aes256'] = Crypting('aes256',16);
exports['aes256-wrap'] = Crypting('aes256-wrap',8);
exports['aria-128-cbc'] = Crypting('aria-128-cbc',16);
exports['aria-128-ccm'] = Crypting('aria-128-ccm',12);
exports['aria-128-cfb'] = Crypting('aria-128-cfb',16);
exports['aria-128-cfb1'] = Crypting('aria-128-cfb1',16);
exports['aria-128-cfb8'] = Crypting('aria-128-cfb8',16);
exports['aria-128-ctr'] = Crypting('aria-128-ctr',16);
exports['aria-128-ecb'] = Crypting('aria-128-ecb',0);
exports['aria-128-gcm'] = Crypting('aria-128-gcm',12);
exports['aria-128-ofb'] = Crypting('aria-128-ofb',16);
exports['aria-192-cbc'] = Crypting('aria-192-cbc',16);
exports['aria-192-ccm'] = Crypting('aria-192-ccm',12);
exports['aria-192-cfb'] = Crypting('aria-192-cfb',16);
exports['aria-192-cfb1'] = Crypting('aria-192-cfb1',16);
exports['aria-192-cfb8'] = Crypting('aria-192-cfb8',16);
exports['aria-192-ctr'] = Crypting('aria-192-ctr',16);
exports['aria-192-ecb'] = Crypting('aria-192-ecb',0);
exports['aria-192-gcm'] = Crypting('aria-192-gcm',12);
exports['aria-192-ofb'] = Crypting('aria-192-ofb',16);
exports['aria-256-cbc'] = Crypting('aria-256-cbc',16);
exports['aria-256-ccm'] = Crypting('aria-256-ccm',12);
exports['aria-256-cfb'] = Crypting('aria-256-cfb',16);
exports['aria-256-cfb1'] = Crypting('aria-256-cfb1',16);
exports['aria-256-cfb8'] = Crypting('aria-256-cfb8',16);
exports['aria-256-ctr'] = Crypting('aria-256-ctr',16);
exports['aria-256-ecb'] = Crypting('aria-256-ecb',0);
exports['aria-256-gcm'] = Crypting('aria-256-gcm',12);
exports['aria-256-ofb'] = Crypting('aria-256-ofb',16);
exports['aria128'] = Crypting('aria128',16);
exports['aria192'] = Crypting('aria192',16);
exports['aria256'] = Crypting('aria256',16);
exports['bf'] = Crypting('bf',8);
exports['bf-cbc'] = Crypting('bf-cbc',8);
exports['bf-cfb'] = Crypting('bf-cfb',8);
exports['bf-ecb'] = Crypting('bf-ecb',0);
exports['bf-ofb'] = Crypting('bf-ofb',8);
exports['blowfish'] = Crypting('blowfish',8);
exports['camellia-128-cbc'] = Crypting('camellia-128-cbc',16);
exports['camellia-128-cfb'] = Crypting('camellia-128-cfb',16);
exports['camellia-128-cfb1'] = Crypting('camellia-128-cfb1',16);
exports['camellia-128-cfb8'] = Crypting('camellia-128-cfb8',16);
exports['camellia-128-ctr'] = Crypting('camellia-128-ctr',16);
exports['camellia-128-ecb'] = Crypting('camellia-128-ecb',0);
exports['camellia-128-ofb'] = Crypting('camellia-128-ofb',16);
exports['camellia-192-cbc'] = Crypting('camellia-192-cbc',16);
exports['camellia-192-cfb'] = Crypting('camellia-192-cfb',16);
exports['camellia-192-cfb1'] = Crypting('camellia-192-cfb1',16);
exports['camellia-192-cfb8'] = Crypting('camellia-192-cfb8',16);
exports['camellia-192-ctr'] = Crypting('camellia-192-ctr',16);
exports['camellia-192-ecb'] = Crypting('camellia-192-ecb',0);
exports['camellia-192-ofb'] = Crypting('camellia-192-ofb',16);
exports['camellia-256-cbc'] = Crypting('camellia-256-cbc',16);
exports['camellia-256-cfb'] = Crypting('camellia-256-cfb',16);
exports['camellia-256-cfb1'] = Crypting('camellia-256-cfb1',16);
exports['camellia-256-cfb8'] = Crypting('camellia-256-cfb8',16);
exports['camellia-256-ctr'] = Crypting('camellia-256-ctr',16);
exports['camellia-256-ecb'] = Crypting('camellia-256-ecb',0);
exports['camellia-256-ofb'] = Crypting('camellia-256-ofb',16);
exports['camellia128'] = Crypting('camellia128',16);
exports['camellia192'] = Crypting('camellia192',16);
exports['camellia256'] = Crypting('camellia256',16);
exports['cast'] = Crypting('cast',8);
exports['cast-cbc'] = Crypting('cast-cbc',8);
exports['cast5-cbc'] = Crypting('cast5-cbc',8);
exports['cast5-cfb'] = Crypting('cast5-cfb',8);
exports['cast5-ecb'] = Crypting('cast5-ecb',0);
exports['cast5-ofb'] = Crypting('cast5-ofb',8);
exports['chacha20'] = Crypting('chacha20',16);
exports['chacha20-poly1305'] = Crypting('chacha20-poly1305',12);
exports['des'] = Crypting('des',8);
exports['des-cbc'] = Crypting('des-cbc',8);
exports['des-cfb'] = Crypting('des-cfb',8);
exports['des-cfb1'] = Crypting('des-cfb1',8);
exports['des-cfb8'] = Crypting('des-cfb8',8);
exports['des-ecb'] = Crypting('des-ecb',0);
exports['des-ede'] = Crypting('des-ede',0);
exports['des-ede-cbc'] = Crypting('des-ede-cbc',8);
exports['des-ede-cfb'] = Crypting('des-ede-cfb',8);
exports['des-ede-ecb'] = Crypting('des-ede-ecb',0);
exports['des-ede-ofb'] = Crypting('des-ede-ofb',8);
exports['des-ede3'] = Crypting('des-ede3',0);
exports['des-ede3-cbc'] = Crypting('des-ede3-cbc',8);
exports['des-ede3-cfb'] = Crypting('des-ede3-cfb',8);
exports['des-ede3-cfb1'] = Crypting('des-ede3-cfb1',8);
exports['des-ede3-cfb8'] = Crypting('des-ede3-cfb8',8);
exports['des-ede3-ecb'] = Crypting('des-ede3-ecb',0);
exports['des-ede3-ofb'] = Crypting('des-ede3-ofb',8);
exports['des-ofb'] = Crypting('des-ofb',8);
exports['des3'] = Crypting('des3',8);
exports['des3-wrap'] = Crypting('des3-wrap',0);
exports['desx'] = Crypting('desx',8);
exports['desx-cbc'] = Crypting('desx-cbc',8);
exports['id-aes128-CCM'] = Crypting('id-aes128-CCM',12);
exports['id-aes128-GCM'] = Crypting('id-aes128-GCM',12);
exports['id-aes128-wrap'] = Crypting('id-aes128-wrap',8);
exports['id-aes128-wrap-pad'] = Crypting('id-aes128-wrap-pad',4);
exports['id-aes192-CCM'] = Crypting('id-aes192-CCM',12);
exports['id-aes192-GCM'] = Crypting('id-aes192-GCM',12);
exports['id-aes192-wrap'] = Crypting('id-aes192-wrap',8);
exports['id-aes192-wrap-pad'] = Crypting('id-aes192-wrap-pad',4);
exports['id-aes256-CCM'] = Crypting('id-aes256-CCM',12);
exports['id-aes256-GCM'] = Crypting('id-aes256-GCM',12);
exports['id-aes256-wrap'] = Crypting('id-aes256-wrap',8);
exports['id-aes256-wrap-pad'] = Crypting('id-aes256-wrap-pad',4);
exports['id-smime-alg-CMS3DESwrap'] = Crypting('id-smime-alg-CMS3DESwrap',0);
exports['idea'] = Crypting('idea',8);
exports['idea-cbc'] = Crypting('idea-cbc',8);
exports['idea-cfb'] = Crypting('idea-cfb',8);
exports['idea-ecb'] = Crypting('idea-ecb',0);
exports['idea-ofb'] = Crypting('idea-ofb',8);
exports['rc2'] = Crypting('rc2',8);
exports['rc2-128'] = Crypting('rc2-128',8);
exports['rc2-40'] = Crypting('rc2-40',88);
exports['rc2-40-cbc'] = Crypting('rc2-40-cbc',8);
exports['rc2-64'] = Crypting('rc2-64',8);
exports['rc2-64-cbc'] = Crypting('rc2-64-cbc',8);
exports['rc2-cbc'] = Crypting('rc2-cbc',8);
exports['rc2-cfb'] = Crypting('rc2-cfb',8);
exports['rc2-ecb'] = Crypting('rc2-ecb',0);
exports['rc2-ofb'] = Crypting('rc2-ofb',8);
exports['rc4'] = Crypting('rc4',0);
exports['rc4-40'] = Crypting('rc4-40',0);
exports['rc4-hmac-md5'] = Crypting('rc4-hmac-md5',0);
exports['seed'] = Crypting('seed',16);
exports['seed-cbc'] = Crypting('seed-cbc',16);
exports['seed-cfb'] = Crypting('seed-cfb',16);
exports['seed-ecb'] = Crypting('seed-ecb',0);
exports['seed-ofb'] = Crypting('seed-ofb',16);
exports['sm4'] = Crypting('sm4',16);
exports['sm4-cbc'] = Crypting('sm4-cbc',16);
exports['sm4-cfb'] = Crypting('sm4-cfb',16);
exports['sm4-ctr'] = Crypting('sm4-ctr',16);
exports['sm4-ecb'] = Crypting('sm4-ecb',0);
exports['sm4-ofb'] = Crypting('sm4-ofb',16);
exports['RSA-MD4'] = Hashing('RSA-MD4');
exports['RSA-MD5'] = Hashing('RSA-MD5');
exports['RSA-MDC2'] = Hashing('RSA-MDC2');
exports['RSA-RIPEMD160'] = Hashing('RSA-RIPEMD160');
exports['RSA-SHA1'] = Hashing('RSA-SHA1');
exports['RSA-SHA1-2'] = Hashing('RSA-SHA1-2');
exports['RSA-SHA224'] = Hashing('RSA-SHA224');
exports['RSA-SHA256'] = Hashing('RSA-SHA256');
exports['RSA-SHA3-224'] = Hashing('RSA-SHA3-224');
exports['RSA-SHA3-256'] = Hashing('RSA-SHA3-256');
exports['RSA-SHA3-384'] = Hashing('RSA-SHA3-384');
exports['RSA-SHA3-512'] = Hashing('RSA-SHA3-512');
exports['RSA-SHA384'] = Hashing('RSA-SHA384');
exports['RSA-SHA512'] = Hashing('RSA-SHA512');
exports['RSA-SHA512/224'] = Hashing('RSA-SHA512/224');
exports['RSA-SHA512/256'] = Hashing('RSA-SHA512/256');
exports['RSA-SM3'] = Hashing('RSA-SM3');
exports['blake2b512'] = Hashing('blake2b512');
exports['blake2s256'] = Hashing('blake2s256');
exports['id-rsassa-pkcs1-v1_5-with-sha3-224'] = Hashing('id-rsassa-pkcs1-v1_5-with-sha3-224');
exports['id-rsassa-pkcs1-v1_5-with-sha3-256'] = Hashing('id-rsassa-pkcs1-v1_5-with-sha3-256');
exports['id-rsassa-pkcs1-v1_5-with-sha3-384'] = Hashing('id-rsassa-pkcs1-v1_5-with-sha3-384');
exports['id-rsassa-pkcs1-v1_5-with-sha3-512'] = Hashing('id-rsassa-pkcs1-v1_5-with-sha3-512');
exports['md4'] = Hashing('md4');
exports['md4WithRSAEncryption'] = Hashing('md4WithRSAEncryption');
exports['md5'] = Hashing('md5');
exports['md5-sha1'] = Hashing('md5-sha1');
exports['md5WithRSAEncryption'] = Hashing('md5WithRSAEncryption');
exports['mdc2'] = Hashing('mdc2');
exports['mdc2WithRSA'] = Hashing('mdc2WithRSA');
exports['ripemd'] = Hashing('ripemd');
exports['ripemd160'] = Hashing('ripemd160');
exports['ripemd160WithRSA'] = Hashing('ripemd160WithRSA');
exports['rmd160'] = Hashing('rmd160');
exports['sha1'] = Hashing('sha1');
exports['sha1WithRSAEncryption'] = Hashing('sha1WithRSAEncryption');
exports['sha224'] = Hashing('sha224');
exports['sha224WithRSAEncryption'] = Hashing('sha224WithRSAEncryption');
exports['sha256'] = Hashing('sha256');
exports['sha256WithRSAEncryption'] = Hashing('sha256WithRSAEncryption');
exports['sha3-224'] = Hashing('sha3-224');
exports['sha3-256'] = Hashing('sha3-256');
exports['sha3-384'] = Hashing('sha3-384');
exports['sha3-512'] = Hashing('sha3-512');
exports['sha384'] = Hashing('sha384');
exports['sha384WithRSAEncryption'] = Hashing('sha384WithRSAEncryption');
exports['sha512'] = Hashing('sha512');
exports['sha512-224'] = Hashing('sha512-224');
exports['sha512-224WithRSAEncryption'] = Hashing('sha512-224WithRSAEncryption');
exports['sha512-256'] = Hashing('sha512-256');
exports['sha512-256WithRSAEncryption'] = Hashing('sha512-256WithRSAEncryption');
exports['sha512WithRSAEncryption'] = Hashing('sha512WithRSAEncryption');
exports['shake128'] = Hashing('shake128');
exports['shake256'] = Hashing('shake256');
exports['sm3'] = Hashing('sm3');
exports['sm3WithRSAEncryption'] = Hashing('sm3WithRSAEncryption');
exports['ssl3-md5'] = Hashing('ssl3-md5');
exports['ssl3-sha1'] = Hashing('ssl3-sha1');
exports['whirlpool'] = Hashing('whirlpool');