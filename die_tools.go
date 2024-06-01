package main

import(
//	"bytes"
//	"compress/gzip"
//	"crypto"
	"crypto/md5"
	"crypto/aes"
	"crypto/cipher"
	crand "crypto/rand"
	"crypto/hmac"
	"crypto/sha256"
	_ "crypto/sha512"
	"golang.org/x/crypto/bcrypt"
//	"golang.org/x/oauth2"
//	"errors"
	"encoding/hex"
	"encoding/json"
	"encoding/base64"
	"fmt"
//	"html"
	"io"
	"io/ioutil"
	"log"
	"math"
	"math/rand"
//	"mime/multipart"
	"net"
	"net/http"
//	"net/url"
	"os"
//	"os/exec"
	"path/filepath"
	"regexp"
//	"runtime"
//	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
//	"github.com/oschwald/geoip2-golang"
)


func Tools_init(){ 
 	rand.Seed( time.Now().UTC().UnixNano() )

	fmt.Println( "Tools Init: Clean Seesions - Startup Report " )

	/*
	CleanOldSessions()
	fmt.Println ( "\nOld sessions have been cleaned.\n" )
	*/
}




//  			E R R O R    
func cErr(err error, note string, bypass bool){
	if( err != nil ){
		if(bypass){
			fmt.Println( getUTCs() + " - " + err.Error() + " - " + note )
		}else{
			log.Fatal(err.Error() + " - " + note)
		}
	}
}
func iExit(i int){ os.Exit(i) }	// 0 no error - # error

func setEEF(e *CommonOutput, er string, field string){setE(e, er); setEF(e, field);}			// Errors and Fields
func setEF(e *CommonOutput, s string){ if !stringInSlice(s, e.EF){ e.EF = append(e.EF, s) } }	// Error Fields - 0ERROR means your sending replacements 0ERR|%d%|40|%R%|50| Error|string|replacement
func setE(e *CommonOutput, s string){ if !stringInSlice(s, e.E){ e.E = append(e.E, s) } }		// Errors - 0ERROR means your sending replacements 0ERR|%d%|40|%R%|50| Error|string|replacement
func setN(e *CommonOutput, s string){ if !stringInSlice(s, e.N){ e.N = append(e.N, s) } }		// Notes
func setR(e *CommonOutput, s string){ setL(e, "RedirectMe", s); }								// Redirect Link from Ajax
func setL(e *CommonOutput, LName string, LLink string){ e.L = append(e.L, CommonOutputLink{LName,LLink}) }		// Links





//          V E R I F I C A T I O N
func iVerifyEmail(s string)bool{
	if ( regexp.MustCompile(`(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}`).MatchString( s ) != true || regexp.MustCompile(`@[^@]*@`).MatchString( s ) == true ) {
		return false
    }
    return true
}
func iCompareStringSlices(a, b []string)bool {
    if a == nil && b == nil { return true; }
    if a == nil || b == nil { return false; }
    if len(a) != len(b) { return false }
    for i := range a {
    	if a[i] != b[i] { return false }
    }
    return true
}






//			C O N V E R S I O N S 
func iParseBool(s string) bool {v,_:=strconv.ParseBool(s);return v}
func iParseFloat(s string) float64 {f, _ := strconv.ParseFloat(s, 64); return f}
func iParseInt(s string) int {
	i, err := strconv.ParseInt( s , 10 , 32 )
		if err != nil { i = 0 }
	return int(i)
}
func iParseInt64(s string) int64 {
	i, err := strconv.ParseInt( s , 10 , 64 )
		if err != nil { i = 0 }
	return i
}

func iFormatBool(b bool) string {v:=strconv.FormatBool(b);return v}
func iFormatInt( i int ) string { return iFormatInt64( int64(i) ) }
func iFormatInt64( i int64 ) string { return strconv.FormatInt( i , 10 ) }

func iFormatFloat4( f float64 ) string { return strconv.FormatFloat(f, 'f', 4, 64) } // 2 precision .00
func iFormatFloat2( f float64 ) string { return strconv.FormatFloat(f, 'f', 2, 64) } // 2 precision .00
func iFormatFloat( f float64 ) string { return strconv.FormatFloat(f, 'f', -1, 64) }

func strToInt(u string)int{ return int( strToInt64(u) ); }
func strToInt64(u string)int64{ i, _ := strconv.ParseInt(u, 10, 64); return i; }
func iCeilToInt(f float64)int{ return int(iCeil(f));}
func iFloorToInt(f float64)int{ return int(iFloor(f));}
func iCeil(f float64)float64{ return math.Ceil(f);}
func iFloor(f float64)float64{ return math.Floor(f);}

func iMoneyMath	(f1 float64, t string, f2 float64) float64 {
	switch t {
		case "+":
			return ( math.Floor(float64(int(f1 * math.Pow10(3)) + int(f2 * math.Pow10(3)) + 5)/10) / 100 )
		case "-":
			return ( math.Floor(float64(int(f1 * math.Pow10(3)) - int(f2 * math.Pow10(3)) + 5)/10) / 100 )
		case "*":
			return ( math.Floor(float64( (int(f1 * math.Pow10(3)) * int(f2 * math.Pow10(3)) ) / 1000 + 5)/10) / 100 )
		case "/":
			return ( math.Floor( ((f1 / f2) * 1000 + 5)/10) / 100 )
	}
	return 0.00
}
func iMoneyBalnace(f1 float64)float64{
	return ( math.Floor( float64(int(f1 * math.Pow10(5) + 5) / 10) ) / 10000 )
}
func iPow(i1, i2 int)int{ return int(iPowF( float64(i1), float64(i2) )) }
func iPowF( f1, f2 float64 )float64{ return math.Pow(f1, f2) } // f1^f2






//  			S T R I N G    
func iEcho( s ...interface{} ){ for i := range s{ fmt.Println( s[i] ) } }
func runTest( s ...interface{} ){ if OneOffTest {OneOffTest = false; iEcho(s);} }
func setTest(){ OneOffTest = true }
func iReplace(s, Me, With string, n int) string { return strings.Replace(s, Me, With, n) }

func iChopString(s string, i int) string { if len(s) > i { return s[:i] } else { return s } }
func iContain(s1 string, s2 string)bool{return strings.Contains(s1, s2)}
func iNumericOnly(s string)string{
	re := regexp.MustCompile( "[^0-9]" )
	return re.ReplaceAllString(s,"")
}
func iStripArray(s string, stripChars []string) string{
	for i:= range stripChars { s = iStrip(s, stripChars[i]) }
	return s
}
func iStrip(str, chr string) string {
    return strings.Map(func(r rune) rune {
        if strings.IndexRune(chr, r) < 0 {
            return r
        }
        return -1
    }, str)
}
func iStripWhite(s string) string {
	ns := ""
	s = iReplace( s, "\r\n", "\n", -1 )
	ss := iSplit( s, "\n", -1, 0)
	for _ , v := range ss {
		if v != "" {
			ns += iTrim( iTrim(v, "\t"), " ") + "\n"
		}
	}
	return strings.TrimRight(ns, "\n")
}
func iStripPrefix( s string, d string ) string {
	i := 0
	for i < len(s) {
		if s[i:i+1] == d { s = s[i+1:]  } else { break }
		i++
	}
	return s
}
func iTrim( s string, d string )string{
	return strings.Trim(s, d)
}
func toTitle(s string)string{ // Capitalizes first letter
	return strings.Title(s)
}
func toUpper(s string)string{
	return strings.ToUpper(s)
}
func toLower(s string)string{
	return strings.ToLower(s)
}

func fileToString( fn string ) string{
	b, err := ioutil.ReadFile(fn)
		cErr(err, "", true)
	return string(b)
}

func iSplit( s string, d string, n int, pad int )[]string{ // n = max number of returned slices -1 all, pad force number of returend slices- 0 none
	sL := strings.SplitN( s, d, n )
	for i:= len(sL); i<pad; i++{
		sL = append( sL , "" )
	}
	return sL
}
func iSort(s []string)[]string{
	sv := len(s)
	for i:=0;i<sv;i++{
		for j:=0;j<sv;j++{
			if s[i] < s[j] {v := s[i]; s[i] = s[j]; s[j]=v;}
		}
	}
	return s
}
func iUniqueSlice(s []string)bool{
	s = iSort(s)
	for i:=0; i<len(s)-1; i++{
		if s[i] == s[i+1] { return false }
	}
	return true
}
func iPad(s string, p string, n int, t string )string{
	ns := ""
	for i:=1; i<= n - len(s); i++{ ns += p }
	if t == "left" {
		ns += s
	} else if t == "right" {
		ns = s + ns
	} else {
		ns += s + ns
	}
	return ns
}
func iExtendSlice(s *[]string, i int){
	if len(*s) < i{
		b := make([]string, i - len(*s) )
		*s = append(*s, b...)
	}
}
func stringInSlice(a string, l []string) bool { 
	for _, b := range l { if b == a { return true } } 
	return false 
}
func iReverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}
func incString(s string) string{ i, _ := strconv.Atoi( s ); i++; return strconv.Itoa( i );}
func CommaString(s string, s2 string)string{if s != "" { s2 = s + "," + s2}; return s2 } // x,y z  = x,y,z
func SliceToCommaString(s []string, addQuotes bool)string{ s2 := ""; for i:= range s{ if addQuotes { s[i] =  `'` + s[i] + `'` }; s2 = CommaString(s2, s[i]) }; return s2 } // [x,y] = x,y
func alphNumString(str string) string {return nonAlphanumericRegex.ReplaceAllString(str, "")}
func alphNumStringNS(str string) string {return nonAlphanumericNSRegex.ReplaceAllString(str, "")}





//  F I L E S 
func iReadFile(fp string) string{
	s, err := ioutil.ReadFile(fp)
		cErr(err, "Reading File Error", true)
	return string(s)
}
func iReadFileByte(fp string) []byte{
	b, err := ioutil.ReadFile(fp)
		cErr(err, "Reading File Byte Error", true)
	return b
}
func iWriteFile(fp string, s string){
    err := ioutil.WriteFile(fp, []byte(s), 0644)
		cErr(err, "Writing File Error", true)
}
func iWriteFileByte(fp string, b []byte){
    err := ioutil.WriteFile(fp, b, 0644)
		cErr(err, "Writing File Error", true)
}
func iExist(path string) bool {
    _, err := os.Stat(path)
    if err == nil { return true }
    if os.IsNotExist(err) { return false }
    return true
}
func (c *Configuration ) getConfig(confFile string) error {
	myConfig, err := os.Open("conf/" + confFile)
	if( err != nil ){ return err }
	defer myConfig.Close()
	decoder := json.NewDecoder(myConfig)
	decoder.Decode(&c)
	return nil
}
func iMakeDir(newpath string){
	_ = os.MkdirAll(newpath, os.ModePerm)
}
func iCopyFile(src, dst string){
	in, err := os.Open(src)
		if err != nil { return }
		defer in.Close()
	out, err := os.Create(dst)
		if err != nil { return }
		defer out.Close()
	_, err = io.Copy(out, in)
	_ = out.Close()
	_ = in.Close()
    return
}
func iFileNameWithoutExt(fileName string) string {
	return strings.TrimSuffix(fileName, filepath.Ext(fileName))
}
func iDeleteFile(fileName string){
   _ = os.Remove(fileName)
}







//  			E N C O D I N G      
func iEncJson( ss interface{} ) string{
	jsonTemp, err := json.Marshal(ss)
		if(err != nil){ return "" }
	if( string(jsonTemp) == "[]" ){ return "" } else { return string(jsonTemp) }
}
func iDecJson(s []byte, ss interface{}){ _ = iDecJsonErr(s, ss) }
func iDecJsonErr(s []byte, ss interface{})error{
	err := json.Unmarshal(s, &ss)
	if err != nil{ return err }; return nil;
}
func JsonToSlice( j []byte ) []string {
	s := make([]string,0)
	json.Unmarshal(j, &s)
	return s
}
func JsonToBoolMap( j []byte ) map[string]bool {
	s := make(map[string]bool)
	json.Unmarshal(j, &s)
	return s
}
func JsonToMapStr( j []byte ) map[string]string {
	s := make(map[string]string)
	json.Unmarshal(j, &s)
	return s
}
func JsonToMapStrSlice( j []byte ) map[string][]string {
	s := make(map[string][]string,0)
	json.Unmarshal(j, &s)
	return s
}
func iMD5( s string ) string {
	hash := md5.New()
	hash.Write( []byte( s ) )
	return fmt.Sprintf("%x", hash.Sum(nil))
}
func cleanMe(s string)string{
	if ! utf8.ValidString(s) || s == "" { return "" }
	return strings.TrimSuffix(strings.TrimPrefix(strings.Trim(iEncJson(s), ` `),`"`),`"`)
}
func iEncBase64(b []byte) string { return base64.StdEncoding.EncodeToString(b) }
func iDecodeBase64(s string) []byte {
    data, _ := base64.StdEncoding.DecodeString(s)
    return data
}
func ComputeHmac256(message string, secret string) string {
    key := []byte(secret)
    h := hmac.New(sha256.New, key)
    h.Write([]byte(message))
    return base64.StdEncoding.EncodeToString(h.Sum(nil))
}
func CryptMe( s string ) string{ return CryptN( s, int( math.Ceil( float64( len( s ) ) / 16) * 16 ) ) }
func CryptN( s string, n int )string{
	// n should be some multipul of 16 - will return a 64 bit cypher.
	plaintext := []byte(s)
	if len(plaintext) < n {
		b := make([]byte, n - len(plaintext) )
		plaintext = append(plaintext,b...)
	}
	block, err := aes.NewCipher(cryptKey)
		cErr(err,"",false)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(crand.Reader, iv); err != nil { panic(err) }
	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(ciphertext[aes.BlockSize:], plaintext)
	return hex.EncodeToString(ciphertext)
}
func DecryptMe( s string )string{
	ciphertext, _ := hex.DecodeString(s)
	block, err := aes.NewCipher(cryptKey)
		cErr(err,"",false)
	if len(ciphertext) < aes.BlockSize { return "" }
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]
	if len(ciphertext)%aes.BlockSize != 0 { return "" }
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(ciphertext, ciphertext)
	return strings.TrimRight(string(ciphertext), "\x00")
}

func bCrypt(p string) string              { s, _ := bCryptErr([]byte(p)); return string(s) }
func bCryptErr(p []byte) ([]byte, error)  { return bcrypt.GenerateFromPassword(p, 12)      }
func bCryptCheck(h string, p string) bool { err := bcrypt.CompareHashAndPassword([]byte(h), []byte(p)); if err != nil { return false }; return true }














//			T I M E   
func stringToUnixTime(s string) UnixTime { sec, _ := strconv.ParseInt(s, 10, 64); return getTimex( time.Unix( sec, 0 ) ); }
func mysqlToUnixTime(msqlTime string) UnixTime { return getTimex( mysqlToTime(msqlTime) ); }
func getUTCs() string {u := getTimex( time.Now().UTC() ); return u.m; }
func getUTC() UnixTime{ return getTimex( time.Now().UTC() ) }
func getTimex(t time.Time) UnixTime {
	u := UnixTime{}
	u.t = t
	u.u = t.Unix()			 						// time.Unix(sec, 0) to return to time.Time
	u.n = t.UnixNano()								// time.Unix(0, nano) to return to time.Time
	u.s = iFormatInt64(u.u)							// stringToUnixTime( s )
	u.m = t.Format(MySQLTimeLayout)					// MySQL format

	u.Day 		= t.Day()
	u.Month 	= int(t.Month())
	u.Year 		= t.Year()
	u.Hour 		= t.Hour()
	u.Minute 	= t.Minute()
	u.Second 	= t.Second()
	u.ValidPost = iMD5(u.s)
	return u
}
func setTime(t time.Time, d int, m string) UnixTime {
	if toLower(m[0:1]) == "d"  { t = t.Add( time.Duration(d) * 24 * time.Hour) }
	if toLower(m[0:1]) == "h"  { t = t.Add( time.Duration(d) * time.Hour) }
	if len(m) > 1 && toLower(m[0:2]) == "mi" { t = t.Add( time.Duration(d) * time.Minute) }
	if len(m) > 1 && toLower(m[0:2]) == "mo" { t = t.Add( time.Duration(d) * 24 * 30 * time.Hour) }
	return getTimex(t)
}
func daysBetweenTimes(t1 time.Time, t2 time.Time)int{ return int(t2.Sub(t1).Hours()/24) }
func MinsBetweenTimes(t1 time.Time, t2 time.Time)int{ return int(t2.Sub(t1).Minutes()) }
func mysqlToTime(t string)time.Time{ newtime, _ := time.Parse(MySQLTimeLayout, t); return newtime }
func mysqlFromTime(t time.Time)string{ return ( t.UTC().Format(MySQLTimeLayout) ) }
func timeParse(s string, tt string) UnixTime { t, _ := time.Parse(tt,  s); return getTimex(t) }
func timeFormat(t time.Time, f string)string{ return t.Format(f) }
func timeZoneFormat(x int)string{ 	h, m := timeM2HM(x); sh := iPad(strconv.Itoa(h), "0", 2, "left"); sm := iPad(strconv.Itoa(m), "0", 2, "left"); if x >= 0 { return "+" + sh + sm }; return "-" + sh + sm }
func timeM2HM(tm int)(int, int){ ftm := int(math.Abs(float64(tm))); h := int( ftm / 60 ); m := int( ftm - (h * 60) ); return h, m}
func timeDidgit(s string)string{
	r := ""; v := "/"; 
	n := iSplit(s, " ", 2, 2);
	if !iContain(n[0], v){ v = "-"}
	if !iContain(n[0], v){ v = ":"}
	d := iSplit(n[0], v, 3, 0)
	t := iSplit(n[1], ":", 3, 0)
	if len(d) > 1 { for i := range d {r+=iPad(d[i], "0", 2, "left"); if i < 2 {r+=v}} }
	if r != "" && t[0] != "" {r+=" "}
	if len(t) > 1 { for i := range t {r+=iPad(t[i], "0", 2, "left"); if i < 2 {r+=":"}} }
	return r
}







//  	U R I 
func (u *MyURI ) SetURI( r *http.Request ) error {
	u.FullHost = r.Host
	u.FullPath = r.URL.Path
	
	hdr := r.Header
	u.REALIP	= hdr.Get("X-Real-Ip") 
	u.REALFOR	= hdr.Get("X-Forwarded-For") 
	u.REALPROTO	= hdr.Get("X-Forwarded-Proto") 

	u.SubDomain = ""
	sdSplit := strings.Split(u.FullHost,".")
	if len(sdSplit) > 2 { for i:=0;i<len(sdSplit)-2;i++{u.SubDomain += sdSplit[i]} }

	u.MyIP, _, _ = net.SplitHostPort( r.RemoteAddr )
	if u.REALIP != "" { u.MyIP = u.REALIP }

	u.Time = time.Now().UTC() 
	tPath := strings.Trim(u.FullPath,"/")
	u.IsHTTPS = false
	u.MyHTTP = "http://"
	u.MyPORT = conf.URLS["port"]
	if r.TLS != nil {
		u.IsHTTPS = true
		u.MyHTTP = "https://"
		u.MyPORT = conf.URLS["sport"]
	}
	tempURI := strings.Split(tPath,"/")
	tempFILE := iSplit( tempURI[ len(tempURI) -1 ], ".", 2, 0 )
	if len(tempFILE) > 1 {
		u.RFilePath = tPath
		u.RFileName = tempFILE[0]
		u.RFileExt = tempFILE[1]
	}

	iExtendSlice(&tempURI,3)
	if tempURI[0] == "" { tempURI[0] = "general" }
	if tempURI[1] == "" { tempURI[1] = tempURI[0] }

	u.Controller  = tempURI[0]
	u.Method      = tempURI[1]
	u.PassVar     = tempURI[2]
	u.PassVars    = tempURI[3:]
	return nil
}
func iUrlToString(url string) string {
    if r, err := http.Get(url); err == nil {
        b, err := ioutil.ReadAll(r.Body)
        r.Body.Close()
        if err == nil {
            return string(b)
        }
    }
    return ""
}
func addHttp(s string)string{
	//var validHTTP = regexp.MustCompile(`(?i)^(f|ht)tps?:\/\/`) - ftp and http
	s = iTrim(s, " ")
	var validHTTP = regexp.MustCompile(`(?i)^https?:\/\/`)
	if ! validHTTP.MatchString(s) { s = "http://" + s }
	return s
}











//		T O Y S
func random(min, max int) int {
	return rand.Intn(max-min) + min // Will return between min and max - 1 random(1, 2) = 1 random (1, 3) = 1 || 2
}
func randomUnique(myArray []string, valueSet []string) {
	l := len(valueSet)
	for i := 0; i < len(myArray); i++ {
		r := random(0, l - i)
		myArray[i] = valueSet[r]
		valueSet[r] = valueSet[ (l - 1 ) - i ]
	}
}
func randomUniqueInt(myArray []int, valueSet []int) {
	l := len(valueSet)
	for i := 0; i < len(myArray); i++ {
		r := random(0, l - i)
		myArray[i] = valueSet[r]
		valueSet[r] = valueSet[ (l - 1 ) - i ]
	}
}
func randomstring(n int, stype string) string {
	b := make([]rune, n)
	l := lettersPlus
	if stype == "letters" { l = letters }
    for i := range b { b[i] = l[rand.Intn(len(l))] }
    return string(b)
}









// M A P S 
func clearMap(m map[string]string){ for k := range m{ delete(m, k) } }
















// S E S S I O N S   A N D    C O O K I E S 

func GetCookie(r *http.Request, c string) SCookie {
	sCookie := SCookie{}
    if myCookie, err := r.Cookie( c ); err == nil {
		iDecJson([]byte( DecryptMe(myCookie.Value) ), &sCookie)
	}
	return sCookie
}

func SetCookie( w http.ResponseWriter, c string, v string, p string, d int  ){
		var cookie *http.Cookie
		if d == 0{																				// Cookie only lasts until the end of the browser session
	    	cookie = &http.Cookie{Name: c , Value: CryptMe(v), Path: p, }
		} else if d == -1{																		// Destroy this cookie
	    	cookie = &http.Cookie{Name: c , Value: CryptMe(v), Path: p, MaxAge: -1, }
		} else {																				// Set the cookie for d days.
	    	cookie = &http.Cookie{Name: c , Value: CryptMe(v), Path: p, Expires: setTime(time.Now().UTC(), d, "d").t, }
		}
   		http.SetCookie(w, cookie)
}

func getUniqueStamp()string{
	t := time.Now().UnixNano();	v := UNQ_ID[0];
	if( UNQ_ID[1] == t ){
		UNQ_ID[0]++; v++;
		return "0" + strconv.FormatInt(v, 10) + ":" + iReverse(strconv.FormatInt(t,10))
	}
	UNQ_ID[1] = t; UNQ_ID[0] = 0
	return "0" + ":" + iReverse(strconv.FormatInt(t, 10))
}
func getSession(w http.ResponseWriter, r *http.Request, allowSetCookie bool, u *MyURI, c SCookie) Session {
	t := getUTC()
	s := Session{}

	s.LoggedIn		= false
	s.Error			= ""
	s.Update		= false
	s.V 			= make(map[string]string)
	if(c.Ver != conf.COOKIE_VERSION && allowSetCookie){
		c.UNQ	= getUniqueStamp() + ":" + conf.SERVER_ID
		c.Ver 	= conf.COOKIE_VERSION
		c.CCode = conf.DEFAULT_COUNTRY["Code"]
		SetCookie( w, "DieRoller", iEncJson(c), "/", 0)
		// Write session to file

	} else if c.Ver != conf.COOKIE_VERSION {
		s.Error = "no_cookie"
	} else {
		s.sess_key 		= c.UNQ
		var v string
		// Pull User on matched cookie or remove cookie

/*
			if err != nil {
				// Sessions not found
				if s.sess_key[0:1] != "0" { CleanSessionID(s.sess_key) }
				SetCookie( w, "DieRoller", iEncJson(c), "/", -1)
				s.Error = "session_end"
				return s
			}
*/
		iDecJson([]byte(v), &s.V)
		if s.user_id > 0 {
			s.LoggedIn = true
			if allowSetCookie && mysqlToTime(s.last_used).Before( setTime(t.t, -20, "D").t ){
				SetCookie( w, "DieRoller", iEncJson(c), "/", 30)
			}
		}
	}
    verify_user_access(&s, u)
	return s
}
func CleanSessionID(id string){
	// Remove Session From Session File
}

func verify_user_access(s *Session, u *MyURI){

    if ! s.LoggedIn {
		switch u.Controller {
			case "admin","billing":
				s.Error = "please_login"
		}
    } else {
		switch u.Controller {
			case "admin":
				if s.admin_level < 1000 {
					s.Error = "page_not_available"
				}
		}

		if s.admin_level < 100 && s.admin_level > 0 {
			if s.admin_level == 2 { s.Error = "account_suspended" }
			if s.admin_level == 3 { s.Error = "account_week_suspended" }
			if s.admin_level == 4 { s.Error = "account_month_suspended" }
		}
    }
}
func iLogout(w http.ResponseWriter, s *Session){
	SetCookie( w, "DieRoller", "", "/", -1)
	// Remove Session from Session File
}


func buildbg(){
	entries, _ := os.ReadDir("public/assets/images/backgrounds/")
	for _, e := range entries {
		ext := strings.ToLower(e.Name()[len(e.Name())-4:])
		if( ext == ".jpg" || ext == ".png" || ext == "webp" || ext == ".gif" ){
			bacground_images = append(bacground_images, e.Name())
		}
	}
}
func randbg()string{
	return bacground_images[rand.Int() % len( bacground_images )]
}


























