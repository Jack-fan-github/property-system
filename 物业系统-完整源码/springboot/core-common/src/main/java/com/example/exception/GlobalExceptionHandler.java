package com.example.exception;

import com.example.common.Result;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ControllerAdvice("com.example.modules")
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseBody // 返回json串
    public Result error(Exception e) {
        e.printStackTrace();
        return Result.error();
    }

    @ExceptionHandler(CustomException.class)
    @ResponseBody // 返回json串
    public Result error(CustomException e) {
        e.printStackTrace();
        return Result.error(e.getCode(),e.getMsg());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseBody
    public Result uploadSizeExceeded(MaxUploadSizeExceededException e) {
        return Result.error("400", "单个文件不能超过5MB，单次上传不能超过35MB");
    }
}
