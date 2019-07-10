// 모듈
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
// mysql
const conn = mysql.createConnection({
    host:'localhost',
    user:'root',    // db user
    password :'java0000',   // db password
    database : 'jjdev'  // db database
});
// 서버 설정
app.set('views',__dirname + '/views');
app.set('view engine','pug');

// 정적 미들웨어
app.use(express.static(__dirname+'/public'));
// post 미들웨어
app.use(bodyParser.urlencoded({extended : true}));
// 라우터 미들웨어
const router = express.Router();
    
    // 수정 요청
    // 수정폼
    router.get('/updateBoard',(req,res)=>{
        console.log('/updateBoard 수정폼 요청');
        const board_no = parseInt(req.query.board_no);
        console.log(board_no);
        conn.query('SELECT board_no,board_pw,board_title,board_content,board_user FROM board WHERE board_no=?'
                ,[board_no],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.render('updateBoard',{updateBoard:rs[0]});
            }
        });
    });
    // 수정액션
    router.post('/updateBoard',(req,res)=>{
        console.log('/updateBoard 수정액션 요청');
        const board_no = req.body.board_no;
        const board_pw = req.body.board_pw;
        const board_title = req.body.board_title;
        const board_content = req.body.board_content;
        conn.query('UPDATE board SET board_title=?,board_content=? WHERE board_pw=? AND board_no=?'
                ,[board_title,board_content,board_pw,board_no],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.redirect('boardList');
            }
        }) 
    });
    
    // 삭제 요청
    // 삭제폼(비밀번호 확인을 위한 )
    router.get('/deleteBoard',(req,res)=>{
        console.log('/deleteBoard 삭제 요청');
        const board_no = parseInt(req.query.board_no);
        console.log(board_no);
        res.render('deleteBoard',{deleteBoard:board_no});
    });
    // 삭제액션
    router.post('/deleteBoard',(req,res)=>{
        console.log('/deleteBoard 삭제 처리');
        const board_no = req.body.board_no;
        const board_pw = req.body.board_pw;
        conn.query('DELETE FROM board WHERE board_no =? AND board_pw=?'
                ,[board_no,board_pw],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.redirect('boardList');
            }
        });
    });


    // 상세내용 보기
    router.get('/boardDetail',(req,res)=>{  
        console.log('/boardDetail 요청');
        if(!req.query.board_no){
            res.redirect('boardList');
        }else{
            conn.query('SELECT board_no,board_title,board_content,board_user,board_date FROM board WHERE board_no=?'
                    ,[parseInt(req.query.board_no)],(err,rs)=>{
                if(err){
                    console.log(err);
                    res.end();
                }else{
                    res.render('boardDetail',{boardDetail:rs[0]});
                }
            });
        }
    });

    // 리스트 요청
    router.get('/boardList',(req,res)=>{
        console.log('/boardList 요청');
        let rowPerPage = 10;    // 페이지당 보여줄 글목록 : 10개
        let currentPage = 1;    
        if(req.query.currentPage){    
            currentPage = parseInt(req.query.currentPage);  
        }
        let beginRow =(currentPage-1)*rowPerPage;   
        console.log(`currentPage : ${currentPage}`);
        let model = {};
        conn.query('SELECT COUNT(*) AS cnt FROM board',(err,result)=>{  //전체 글목록 행 갯수 구하기
            if(err){
                console.log(err);
                res.end();
            }else{
                console.log(`totalRow : ${result[0].cnt}`);
                let totalRow = result[0].cnt;
                lastPage = totalRow / rowPerPage;   
                if(totalRow % rowPerPage != 0){ 
                    lastPage++;
                }
            }

            conn.query('SELECT board_no,board_title,board_user FROM board ORDER BY board_no DESC LIMIT ?,?'
                    ,[beginRow,rowPerPage],(err,rs)=>{   
                if(err){   
                    console.log(err);
                    res.end();
                }else{
                    model.boardList = rs;
                    model.currentPage = currentPage;
                    model.lastPage = lastPage;
                    res.render('boardList',{model:model});
                }
            });
        });  
    });


    // 입력 요청
    // 입력폼
    router.get('/addBoard',(req,res)=>{
        console.log('/addBoard 입력폼 요청');
        res.render('addBoard');
    });
    // 입력액션
    router.post('/addBoard',(req,res)=>{
        console.log('/addBoard 입력액션 요청');
        const board_pw = req.body.board_pw;
        const board_title = req.body.board_title;
        const board_content = req.body.board_content;
        const board_user = req.body.board_user;
        const board_date = req.body.board_date;
 
        conn.query('INSERT INTO board(board_pw,board_title,board_content,board_user,board_date) VALUES(?,?,?,?,now())'
                ,[board_pw , board_title , board_content , board_user], (err, result)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.redirect('boardList');
            }
        });   
    });
app.use('/',router);
// 미들웨어 설정 끝
// 80번포트 웹서버 실행
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});