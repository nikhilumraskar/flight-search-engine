<?php

class Tentwenty_Flight_SearchController extends Mage_Core_Controller_Front_Action
{
    public function indexAction()
    {
        $this->loadLayout();
        $this->renderLayout();
    }
    
    public function queryAction()
    {
        echo 'queryAction gives json response';
    }
}