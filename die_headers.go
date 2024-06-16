package main

import(
	"time"
	"regexp"
//	"database/sql"
//	_ "github.com/go-sql-driver/mysql"
)

const (
	MySQLTimeLayout = "2006-01-02 15:04:05"			// 2006-05-19 15:04:05
	TimeLayoutTZ 	= "01/02/2006 03:04PM -0700" 	// 05/19/2011 10:47PM +0315
	TimeLayout		= "01/02/2006 03:04PM" 			// 05/19/2011 10:47PM
	TimeLayoutDate	= "01/02/2006"					// 05/19/2011
	TimeHMS			= "15:04:05"					// 15:04:05
	TimeLayout24	= "01/02/2006 15:04:05"			// 05/19/2011 15:04:05
	TimeFile24		= "01-02-2006 15:04:05"			// 05-19-2011-15:04:05
)

var conf 		Configuration
var OneOffTest	= false		// Call setTest() to trigger the next runTest( string... ) encountered. 
var letters 	= []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
var lettersPlus = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
var nonAlphanumericRegex   = regexp.MustCompile(`[^a-zA-Z0-9 ]+`)
var nonAlphanumericNSRegex = regexp.MustCompile(`[^a-zA-Z0-9]+`)
var cryptKey 	= []byte("dndRagOns#7K39Oo") // 16 bytes or die
var LastSDBI	= -1		// The last session index this application server used db[x].
var UNQ_ID		= []int64{0,0}	// Unique ID reset every few seconds.
// var isLoggedIn  = false    // is logged in
// var users       = []Users{}     // The user.
// var Cookie      = []SCookie{}   // The user Cookie.
var bacground_images = []string{}  // List of available background image names. 

// C O N F I G U R A T I O N 
type Configuration struct {
	SERVER_ID			string				// Special ID for each server for uniqueness
	SERVER_IS_ADMIN		bool				// Only Administrative server can run database work and server work
	HTTPPORT            string              // Serving port
	HTTPSPORT           string              // Serving port for https
	USEHTTPS            int                 // 1 true 0 false for using the https server

	SERVER			    map[string]int 		// server settings. 
	SERVERSCRT			map[string]string 	// server string settings.
	
	VERSION				[]string
	COOKIE_VERSION		string

	TESTING				map[string]bool		// Testing areas
	DEFAULT_LANG		string
	DEFAULT_COUNTRY		map[string]string	// Name : Short : Code : Currency
	SESS_EXPIRE_MINS	int

	PATHS 				map[string]string	// Server Paths
	URLS 				map[string]string	// Site URLS - base - file - port - secure port
	
	SITEID				string
	
	NOTIFY_URLS			[]string
	SCRIPT_URLS			[]string
	
	EMAIL_SERVER		map[string][]string	// Email Credentials 
	EMAILS				map[string]string 	// list of emails default / sales / info / chuck 

	UPDATE_CREDS		bool				// Will update credentials db when true.
	CREDS				map[string]string
	CREDENTIALS			map[string]string
	
	STRING_VALS			map[string]string	// string name value pair
	INT_VALS			map[string]int		// int name value pair
	BOOL_VALS			map[string]bool		// bool name value pair
	TIME_VALS			map[string]string	// MySQL Times
	FLOAT_VALS			map[string]float64	// float name value pair
	PRODS				map[string]float64	// Product Name and Price


}


// Users 
type Users struct {
	Username 	string	`json:"un"`		// User name 
	Password 	string	`json:"pw"`		// Password 
	Status      int     `json:"st"`     // User Status 1000 admin , 100 manager, 2 banned, 0 none
	Cookiepass	string	`json:"ck"`		// Cookie Pass
	Crosssite 	string	`json:"cx"`		// Ajax Form Pass 
}

type Dierolls struct {
	User 		string	`json:"u"`		// User who rolled 
	Char        string  `json:"c"`		// Character who rolled
	D1 			string	`json:"d1"`		// Die 1 
	D2 			string	`json:"d2"`		// Die 2 
	R1	 		string	`json:"r1"`		// Result 
}

type Character struct {
	Cid  		string	`json:"id"` 				// Character id UN_1 
	Cname 		string	`json:"char_name"`			// Character Name
	Crace 		string	`json:"char_race"`			// Character Race
	Caura 		string	`json:"char_aura"`	  		// Character Aura (hook for DM to play with if you want)
	Calign 		string	`json:"char_alignment"`		// Character Alignment
	Cage 		string	`json:"char_age"`			// Character Age
	Cheight		string	`json:"char_height"`		// Character Height
	Cweight		string	`json:"char_weight"`		// Character Weight
	Cskin 		string	`json:"char_skin"`			// Character Skin
	Ceyes 		string	`json:"char_eyes"`			// Character Eyes
	Chair 		string	`json:"char_hair"`			// Character Hair

	Cstrop1		string	`json:"char_str_op1"`		// Strength Option 1
	Cstrop2		string	`json:"char_str_op2"`		// Strength Option 2
	Cstrop3		string	`json:"char_str_op3"`		// Strength Option 3
	Cstrop1t	string	`json:"char_str_op1t"` 			// Strength Option 1 Title
	Cstrop2t	string	`json:"char_str_op2t"`			// Strength Option 2 Title
	Cstrop3t	string	`json:"char_str_op3t"`			// Strength Option 3 Title
	Cstr 		string	`json:"char_str"`			// Strength
	Cstrbonus	string	`json:"char_str_bonus"`		// Strength Bonus
	Cdexop1		string	`json:"char_dex_op1"`		// Dexterity Option 1 
	Cdexop2		string	`json:"char_dex_op2"`		// Dexterity Option 2 
	Cdexop3		string	`json:"char_dex_op3"`		// Dexterity Option 3 
	Cdexop1t	string	`json:"char_dex_op1t"`			// Dexterity Option 1 Title
	Cdexop2t	string	`json:"char_dex_op2t"`			// Dexterity Option 2 Title 
	Cdexop3t	string	`json:"char_dex_op3t"`			// Dexterity Option 3 Title
	Cdex 		string	`json:"char_dex"`			// Dexterity
	Cdexbonus	string	`json:"char_dex_bonus"`		// Dexterity Bonus
	Cconop1		string	`json:"char_con_op1"`		// Constitution Option 1
	Cconop2		string	`json:"char_con_op2"`		// Constitution Option 2
	Cconop3		string	`json:"char_con_op3"`		// Constitution Option 3
	Cconop1t	string	`json:"char_con_op1t"`			// Constitution Option 1 Title
	Cconop2t	string	`json:"char_con_op2t"`			// Constitution Option 2 Title
	Cconop3t	string	`json:"char_con_op3t"`			// Constitution Option 3 Title
	Ccon 		string	`json:"char_con"`			// Constitution
	Cconbonus	string	`json:"char_con_bonus"`		// Constitution Bonus
	Cintop1		string	`json:"char_int_op1"`		// Intellegence Option 1
	Cintop2		string	`json:"char_int_op2"`		// Intellegence Option 2
	Cintop3		string	`json:"char_int_op3"`		// Intellegence Option 3
	Cintop1t	string	`json:"char_int_op1t"`			// Intellegence Option 1 Title
	Cintop2t	string	`json:"char_int_op2t"`			// Intellegence Option 2 Title
	Cintop3t	string	`json:"char_int_op3t"`			// Intellegence Option 3 Title
	Cint 		string	`json:"char_int"`			// Intellegence
	Cintbonus	string	`json:"char_int_bonus"`		// Intellegence Bonus
	Cwisop1		string	`json:"char_wis_op1"`		// Wisdom Option 1
	Cwisop2		string	`json:"char_wis_op2"`		// Wisdom Option 2
	Cwisop3		string	`json:"char_wis_op3"`		// Wisdom Option 3 
	Cwisop1t	string	`json:"char_wis_op1t"`			// Wisdom Option 1 Title
	Cwisop2t	string	`json:"char_wis_op2t"`			// Wisdom Option 2 Title
	Cwisop3t	string	`json:"char_wis_op3t"`			// Wisdom Option 3 Title
	Cwis 		string	`json:"char_wis"`			// Wisdom
	Cwisbonus	string	`json:"char_wis_bonus"`		// Wisdom Bonus
	Cchaop1		string	`json:"char_cha_op1"`		// Charisma Option 1 
	Cchaop2		string	`json:"char_cha_op2"`		// Charisma Option 2 
	Cchaop3		string	`json:"char_cha_op3"`		// Charisma Option 3 
	Cchaop1t	string	`json:"char_cha_op1t"`			// Charisma Option 1 Title 
	Cchaop2t	string	`json:"char_cha_op2t"`			// Charisma Option 2 Title 
	Cchaop3t	string	`json:"char_cha_op3t"`			// Charisma Option 3 Title
	Ccha 		string	`json:"char_cha"`			// Charisma
	Cchabonus	string	`json:"char_cha_bonus"`		// Charisma Bonus

	Cac 		string	`json:"char_ac"`			// Armor Class
	Carmor 		string	`json:"char_ac_armor"`		// Armor Value
	Cshield		string	`json:"char_ac_shield"`		// Shield Value
	Chp 		string	`json:"char_hp"`			// Current HP
	Cmax 		string	`json:"char_hp_max"`		// Maximum HP
	Ctmp 		string	`json:"char_hp_tmp"`		// Temporary HP
	Cspeed 		string	`json:"char_speed"`			// Movement Speed
	Cswim 		string	`json:"char_speed_swim"`	// Swim Speed
	Cfly 		string	`json:"char_speed_fly"`		// Fly Speed

	Clevel 		string	`json:"char_level"`			// Level
	Cxp 		string	`json:"char_level_xp"`		// Experience
	Csp 		string	`json:"char_level_sp"`		// Spell Power
	Cdmp 		string	`json:"char_level_dmp"`		// Dragon Magic Points
	Cpsp 		string	`json:"char_level_psp"`		// Psyonic Power Points

	Cclass 		string	`json:"char_classes"`		// Class List
	Cbackground string	`json:"char_background"`	// Character Background 
	Clanguage   string	`json:"char_languages"`		// Character Languages 
	Cnotes 		string	`json:"char_notes"`			// Notes
	Cfeatures 	string	`json:"char_features"`		// Features List
	Cspells 	string	`json:"char_spells"`		// Spell List
	Cweapons 	string	`json:"char_weapons"`		// Weapon List
	Carmors 	string	`json:"char_armors"`		// Armor List
	Cequipments string	`json:"char_equipments"`	// Equiptment List
	Cbank1      string	`json:"char_bank1"`			// Character Platinum
	Cbank2      string	`json:"char_bank2"`			// Character Gold
	Cbank3      string	`json:"char_bank3"`			// Character Silver
	Cbank4      string	`json:"char_bank4"`			// Character Copper
	Ctreasures  string	`json:"char_treasures"`		// Character Treasure
	Cvideos     string	`json:"char_videos"`  		// Character Video

	Ctog1 		string	`json:"char_toggle1"`		// Toggle 1
	Ctog2 		string	`json:"char_toggle2"`		// Toggle 2
	Ctog3 		string	`json:"char_toggle3"`		// Toggle 3
	Ctog4 		string	`json:"char_toggle4"`		// Toggle 4
	Ctog5 		string	`json:"char_toggle5"`		// Toggle 5
	Ctog6 		string	`json:"char_toggle6"`		// Toggle 6
	Ctog1t 		string	`json:"char_toggle1t"`		// Toggle 1 Title
	Ctog2t 		string	`json:"char_toggle2t"`		// Toggle 2 Title
	Ctog3t 		string	`json:"char_toggle3t"`		// Toggle 3 Title
	Ctog4t 		string	`json:"char_toggle4t"`		// Toggle 4 Title
	Ctog5t 		string	`json:"char_toggle5t"`		// Toggle 5 Title
	Ctog6t 		string	`json:"char_toggle6t"`		// Toggle 6 Title

	Cop1 		string	`json:"char_op1"`		// Option 1
	Cop2 		string	`json:"char_op2"`		// Option 2
	Cop3 		string	`json:"char_op3"`		// Option 3
	Cop4 		string	`json:"char_op4"`		// Option 4
	Cop5 		string	`json:"char_op5"`		// Option 5
	Cop6 		string	`json:"char_op6"`		// Option 6
	Cop7 		string	`json:"char_op7"`		// Option 7
	Cop8 		string	`json:"char_op8"`		// Option 8
	Cop9 		string	`json:"char_op9"`		// Option 9
	Cop10 		string	`json:"char_op10"`		// Option 10
	Cop11 		string	`json:"char_op11"`		// Option 11
	Cop12		string	`json:"char_op12"`		// Option 12
	Cop13 		string	`json:"char_op13"`		// Option 13
	Cop14 		string	`json:"char_op14"`		// Option 14
	Cop15 		string	`json:"char_op15"`		// Option 15
	Cop16 		string	`json:"char_op16"`		// Option 16
	Cop17 		string	`json:"char_op17"`		// Option 17
	Cop18 		string	`json:"char_op18"`		// Option 18
	Cop1t 		string	`json:"char_op1t"`		// Option 1 Title
	Cop2t 		string	`json:"char_op2t"`		// Option 2 Title
	Cop3t 		string	`json:"char_op3t"`		// Option 3 Title
	Cop4t 		string	`json:"char_op4t"`		// Option 4 Title
	Cop5t 		string	`json:"char_op5t"`		// Option 5 Title
	Cop6t 		string	`json:"char_op6t"`		// Option 6 Title
	Cop7t 		string	`json:"char_op7t"`		// Option 7 Title
	Cop8t 		string	`json:"char_op8t"`		// Option 8 Title
	Cop9t 		string	`json:"char_op9t"`		// Option 9 Title
	Cop10t 		string	`json:"char_op10t"`		// Option 10 Title
	Cop11t 		string	`json:"char_op11t"`		// Option 11 Title
	Cop12t		string	`json:"char_op12t"`		// Option 12 Title
	Cop13t 		string	`json:"char_op13t"`		// Option 13 Title
	Cop14t 		string	`json:"char_op14t"`		// Option 14 Title
	Cop15t 		string	`json:"char_op15t"`		// Option 15 Title
	Cop16t 		string	`json:"char_op16t"`		// Option 16 Title
	Cop17t 		string	`json:"char_op17t"`		// Option 17 Title
	Cop18t 		string	`json:"char_op18t"`		// Option 18 Title

	Cisnpc 		string	`json:"char_npc"`		// Charicter is an NPC and hidden from others

}


type Hreqs struct {
	VALS			map[string]string  `json:"vals"`	// string name value pair
}


// U R I   T Y P E S 
type MyURI struct {
	FullHost	string			// Full HOST test.bunnyfire.com:7600
	FullPath	string			// Full URL Path from request
	IsHTTPS		bool			// true or false
	MyHTTP		string			// http:// or https://

	REALIP		string			// As sent to NGINX IP Value
	REALFOR		string			// As sent to NGINX IP Plus Port
	REALPROTO	string			// As sent to NGINX http:// or https://

	SubDomain	string			// Subdomain
	MyPORT		string			// Currently using port :xxxx
	Controller 	string			// General
	Method 		string			// Login
	PassVar		string			// FirstName
	PassVars	[]string		// Lastname, Date of Birth
	RFilePath	string			// Requested File Path
	RFileName	string			// Requested File Name
	RFileExt	string			// Requested File Extension
	MyIP		string			// Users IP - taken from NGINX if not empty
	Time		time.Time		// Request Time in Time format UTC
}


// C O M M O N  T O Y S
type CommonOutputLink struct{
	N	string	// Name of the link - parsed in javascript to reveal english or language
	L	string	// Link associated with the name ( RedirectMe - Reserved for forcing a redirect )
}
type CommonOutput struct{
	E		[]string 			// Errors
	N		[]string 			// Notes
	EF		[]string 			// ErrorFields
	L		[]CommonOutputLink 	// Links
}
type UnixTime struct{
	t			time.Time	// t.time
	u			int64		// t.Unix
	n			int64		// t.UnixNano
	s 			string		// t.string
	m 			string		// t.MySQLFormat
	Day			int			// t.Day
	Month		int			// t.Month
	Year		int			// t.Year
	Hour		int			// t.Hour
	Minute		int			// t.Minute
	Second		int			// t.Second
	ValidPost	string		// post_valid form field matcher 
}





// S E S S I O N
type SCookie struct{
	UN		string	`json:"u"`		// Username
	UNQ		string	`json:"q"`		// Unique session key
	Ver		string	`json:"v"`		// Cookie Version
	CCode	string	`json:"c"`		// Country Code
	SDBI	int 	`json:"s"`		// Session Database ID & Application ID
}
type Session struct{
	sess_key		string		// Special Key for session from cookie. Multipul device allow same cookie key.
	time_start		string		// This session was created on this date
	last_used		string		// Last time session was activated - maybe last login
	V				map[string]string // stored in session json field
	user_id			int64		// Is logged in if has a user ID
	email			string		// User Email
	language		string		// User Lang default eng
	timezone		int			// Timezone number of minutes + or - UTC
	zipcode			string		// Zip Code
	admin_level		int			// Show admin JS on page load.
	stay_on			bool		// Stay Logged In
	SDBI			int			// Session Database to use
	
	LoggedIn		bool		// This is not stored in the database, checked every time user sends sess with user id.
	Error 			string		// This is only used if I want to redirect the user to a new page based on an error. 
	Update			bool		// Update the session in the database
}
