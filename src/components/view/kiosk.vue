<!--
@Author: Adam Oberg <Adam>
@Date:   2020-05-15 T2:00:00-03:00
@Email:  adam.oberg@oregonstate.edu
@Last modified by:   Adam
@Last modified time: 2020-05-16 T04:30-06:00PM
-->
<template>
    <el-row class = "sus-main" type="flex" justify ="center" align = "middle">
        <el-col class = "content">
        </el-col>
        <video autoplay muted loop id='Sus-bkg-video'>
            <source src='images/video.mp4' type='video/mp4'>
        </video>
        <el-col type="flex" class = 'text-content' justify ="center" align="middle">
            <el-row class='sus-title'>
                <el-col class = 'sus-title'>
                     Sustainability at OSU
                </el-col>
            </el-row>
            <el-row class='sus-info'>
                <el-col class = 'sus-info'>
                  Tap for more info.
                </el-col>
            </el-row>
                <el-row id = "button-links" type = "flex" justify ="space-around">
                     <el-col />
                     <el-col />
                     <el-col>
                         <a href="http://fa.oregonstate.edu/sustainability"><el-button id="myBtn">Sustainability Website</el-button></a>
                     </el-col>
                     <el-col>
                         <a href="http://carbon.campusops.oregonstate.edu/tabling/jeopardy"><el-button id="myBtn">Sustainability Jeopardy</el-button></a>
                     </el-col>
                     <el-col>
                          <a href="https://myco2.sustainability.oregonstate.edu/"><el-button id="myBtn">Carbon Footprint Calculator</el-button></a>
                     </el-col>
                     <el-col />
                     <el-col />
                </el-row>

        </el-col>
    </el-row>
</template>

<script>
export default {
}
</script>

<style scoped lang="scss">
  .sus-main{
     position: fixed;
     left: 0;
     bottom: 0;
     min-width: 100%;
     width: 100%;
     min-height: 100%;
     overflow: hidden;
     margin: 0px;
     padding: 0px;
     z-index: 0;
    }

    /* Style the video: 100% width and height to cover the entire window */
  video {
     position: fixed;
     left: 0;
     bottom: 0;
     min-width: 100%;
     width: 100%;
     min-height: 100%;
     overflow: hidden;
     margin: 0px;
     padding: 0px;
     z-index: -2;
    }
   .content{
     position: fixed;
     left: 0;
     bottom: 0;
     min-width: 100%;
     width: 100%;
     min-height: 100%;
     overflow: hidden;
     margin: 0px;
     padding: 0px;
     background: rgba(0, 0, 0, 0.5);
     z-index: -1;
    }
    .text-content{
     font-size: $--font-size-large;
     position: fixed;
     display: block;
     font-family: StratumNo2;
     color: $--color-white;
    //  width: 100%;
     padding: 20px;
    //  padding-top: 10em;
    //  height: 100%;
    }
    .sus-title{
     color: $--color-white;
     font-size: 2.5em;
    }
    .sus-info{
     color: $--color-white;
     font-size: 1.5em;
    }
    .button-links{
        margin: 10px;
    }
    #myBtn{
     margin:20px;
     font-size: 18px;
     padding: 10px;
     height: 4em;
     border: 1px solid $--color-white;
     background: rgba(0, 0, 0, 0);
     color: $--color-white;
     cursor: pointer;
    }
    #myBtn:hover{
     background: $--color-white;
     color: $--color-black;
    }
</style>
